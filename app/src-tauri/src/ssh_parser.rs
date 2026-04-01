use std::fs;

#[derive(Debug, Clone, serde::Serialize)]
pub struct SshHost {
    pub host: String,
    pub hostname: Option<String>,
    pub user: Option<String>,
    pub port: Option<u16>,
    pub identity_file: Option<String>,
    pub identities_only: bool,
    pub proxy_command: Option<String>,
}

pub fn parse_ssh_config(path: &str) -> Vec<SshHost> {
    let content = fs::read_to_string(path).unwrap_or_default();

    let mut hosts = Vec::new();
    let mut current: Option<SshHost> = None;

    for raw in content.lines() {
        let line = raw.trim();

        if line.is_empty() || line.starts_with("#") {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }

        let key = parts[0].to_lowercase();
        let value = parts[1..].join(" ");

        match key.as_str() {
            "host" => {
                if let Some(h) = current.take() {
                    hosts.push(h);
                }

                current = Some(SshHost {
                    host: value,
                    hostname: None,
                    user: None,
                    port: None,
                    identity_file: None,
                    identities_only: false,
                    proxy_command: None,
                });
            }

            "hostname" => {
                if let Some(h) = &mut current {
                    h.hostname = Some(value);
                }
            }

            "user" => {
                if let Some(h) = &mut current {
                    h.user = Some(value);
                }
            }

            "port" => {
                if let Some(h) = &mut current {
                    h.port = value.parse().ok();
                }
            }

            "identityfile" => {
                if let Some(h) = &mut current {
                    h.identity_file = Some(value);
                }
            }

            "identitiesonly" => {
                if let Some(h) = &mut current {
                    h.identities_only = value.to_lowercase() == "yes";
                }
            }

            "proxycommand" => {
                if let Some(h) = &mut current {
                    h.proxy_command = Some(value);
                }
            }

            _ => {}
        }
    }

    if let Some(h) = current {
        hosts.push(h);
    }

    hosts
}