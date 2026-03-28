#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ssh2::{Session, Channel};
use std::net::TcpStream;
use std::sync::{Mutex, Arc};
use once_cell::sync::Lazy;
use std::io::{Read, Write};
use std::collections::HashMap;
use std::thread;

use tauri::Emitter;

struct SSHState {
    _session: Session,
    channel: Arc<Mutex<Channel>>,
}

// 🔥 MULTI SESSION STORAGE
static SSH_SESSIONS: Lazy<Mutex<HashMap<String, SSHState>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

#[tauri::command]
fn ssh_connect(
    app: tauri::AppHandle,
    session_id: String,
    host: String,
    user: String,
    password: String,
) -> Result<String, String> {
    let tcp = TcpStream::connect(format!("{}:22", host))
        .map_err(|e| format!("TCP error: {}", e))?;

    let mut sess = Session::new()
        .map_err(|e| format!("Session error: {}", e))?;

    sess.set_tcp_stream(tcp);

    sess.handshake()
        .map_err(|e| format!("Handshake error: {}", e))?;

    sess.userauth_password(&user, &password)
        .map_err(|e| format!("Auth error: {}", e))?;

    if !sess.authenticated() {
        return Err("Authentication failed".into());
    }

    let mut channel = sess.channel_session()
        .map_err(|e| format!("Channel error: {}", e))?;

    channel.request_pty("xterm", None, None)
        .map_err(|e| format!("PTY error: {}", e))?;

    channel.shell()
        .map_err(|e| format!("Shell error: {}", e))?;

    sess.set_blocking(false);

    let channel = Arc::new(Mutex::new(channel));

    // 🔥 Background reader thread per session
    let reader_channel = channel.clone();
    let app_handle = app.clone();
    let sid = session_id.clone();

    thread::spawn(move || {
        let mut buffer = [0u8; 8192];

        loop {
            let mut chan = reader_channel.lock().unwrap();

            match chan.read(&mut buffer) {
                Ok(n) if n > 0 => {
                    let output =
                        String::from_utf8_lossy(&buffer[..n]).to_string();

                    // 🔥 Emit with session_id
                    let _ = app_handle.emit(
                        &format!("ssh-output-{}", sid),
                        output,
                    );
                }

                Err(ref e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                    drop(chan);
                    std::thread::sleep(std::time::Duration::from_millis(10));
                }

                Err(_) => break,
                _ => {}
            }
        }
    });

    // 🔥 store session
    SSH_SESSIONS.lock().unwrap().insert(
        session_id.clone(),
        SSHState {
            _session: sess,
            channel,
        },
    );

    Ok("connected".into())
}

#[tauri::command]
fn ssh_write(session_id: String, input: String) -> Result<(), String> {
    let mut sessions = SSH_SESSIONS.lock().unwrap();

    if let Some(state) = sessions.get_mut(&session_id) {
        let mut chan = state.channel.lock().unwrap();

        chan.write_all(input.as_bytes())
            .map_err(|e| format!("Write error: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
fn ssh_disconnect(session_id: String) {
    SSH_SESSIONS.lock().unwrap().remove(&session_id);
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