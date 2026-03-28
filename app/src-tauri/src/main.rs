#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use once_cell::sync::Lazy;
use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::Emitter;

enum AuthState {
    Init,
    JumpPassword,
    TargetPassword,
    Passphrase,
    Connected,
    Failed,
}

struct SSHState {
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    child: Arc<Mutex<Box<dyn portable_pty::Child + Send + Sync>>>,
}

static SSH_SESSIONS: Lazy<Mutex<HashMap<String, SSHState>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

#[derive(serde::Deserialize, Clone)]
struct JumpHost {
    host: String,
    user: String,
    password: Option<String>,
}

#[tauri::command]
fn ssh_connect(
    app: tauri::AppHandle,
    session_id: String,
    host: String,
    user: String,
    password: Option<String>,
    private_key: Option<String>,
    passphrase: Option<String>,
    jump_host: Option<JumpHost>,
) -> Result<String, String> {
    let pty_system = native_pty_system();

    let pair = pty_system
        .openpty(PtySize {
            rows: 40,
            cols: 120,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| e.to_string())?;

    let mut cmd = CommandBuilder::new("ssh");

    cmd.arg("-tt");
    cmd.arg("-o");
    cmd.arg("StrictHostKeyChecking=no");
    cmd.arg("-o");
    cmd.arg("UserKnownHostsFile=/dev/null");

    if let Some(jump) = &jump_host {
        cmd.arg("-J");
        cmd.arg(format!("{}@{}", jump.user, jump.host));
    }

    if let Some(key) = private_key {
        let key_path = format!("/tmp/ssh_key_{}", session_id);

        std::fs::write(&key_path, key).map_err(|e| e.to_string())?;

        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&key_path, std::fs::Permissions::from_mode(0o600)).ok();

        cmd.arg("-i");
        cmd.arg(key_path);
    }

    cmd.arg(format!("{}@{}", user, host));

    let child = pair.slave.spawn_command(cmd).map_err(|e| e.to_string())?;
    let child = Arc::new(Mutex::new(child));

    let mut reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;
    let writer = pair.master.take_writer().map_err(|e| e.to_string())?;
    let writer = Arc::new(Mutex::new(writer));

    let writer_clone = writer.clone();
    let app_handle = app.clone();
    let sid = session_id.clone();

    let jump_password = jump_host.and_then(|j| j.password);
    let target_password = password;
    let passphrase = passphrase;

    thread::spawn(move || {
        let mut buffer = [0u8; 8192];
        let mut state = AuthState::Init;

        loop {
            match reader.read(&mut buffer) {
                Ok(n) if n > 0 => {
                    let output = String::from_utf8_lossy(&buffer[..n]).to_string();

                    // ✅ SEND OUTPUT TO FRONTEND
                    let _ = app_handle.emit(
                        &format!("ssh-output-{}", sid),
                        output.clone()
                    );

                    let text = output.to_lowercase();
                    let mut w = writer_clone.lock().unwrap();

                    match state {
                        AuthState::Init => {
                            if text.contains("password:") {
                                if let Some(ref jp) = jump_password {
                                    let _ = w.write_all(format!("{}\n", jp).as_bytes());
                                    state = AuthState::JumpPassword;
                                } else if let Some(ref tp) = target_password {
                                    let _ = w.write_all(format!("{}\n", tp).as_bytes());
                                    state = AuthState::TargetPassword;
                                }
                            } else if text.contains("passphrase") {
                                if let Some(ref pp) = passphrase {
                                    let _ = w.write_all(format!("{}\n", pp).as_bytes());
                                    state = AuthState::Passphrase;
                                }
                            }
                        }

                        AuthState::JumpPassword => {
                            if text.contains("password:") {
                                if let Some(ref tp) = target_password {
                                    let _ = w.write_all(format!("{}\n", tp).as_bytes());
                                    state = AuthState::TargetPassword;
                                }
                            }
                        }

                        AuthState::TargetPassword => {
                            if text.contains("$") || text.contains("#") {
                                state = AuthState::Connected;
                            }
                        }

                        AuthState::Passphrase => {
                            if text.contains("$") || text.contains("#") {
                                state = AuthState::Connected;
                            }
                        }

                        AuthState::Connected => {}

                        AuthState::Failed => break,
                    }

                    if text.contains("permission denied") {
                        state = AuthState::Failed;
                    }
                }
                Err(_) => break,
                _ => {}
            }
        }
    });

    SSH_SESSIONS.lock().unwrap().insert(
        session_id,
        SSHState { writer, child }
    );

    Ok("connected".into())
}

#[tauri::command]
fn ssh_write(session_id: String, input: String) -> Result<(), String> {
    let sessions = SSH_SESSIONS.lock().unwrap();

    if let Some(state) = sessions.get(&session_id) {
        let mut writer = state.writer.lock().unwrap();
        writer.write_all(input.as_bytes()).map_err(|e| e.to_string())?;
        writer.flush().ok();
    }

    Ok(())
}

#[tauri::command]
fn ssh_disconnect(session_id: String) {
    if let Some(state) = SSH_SESSIONS.lock().unwrap().remove(&session_id) {
        let mut child = state.child.lock().unwrap();
        let _ = child.kill();
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            ssh_connect,
            ssh_write,
            ssh_disconnect
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}