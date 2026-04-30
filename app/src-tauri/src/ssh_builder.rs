use portable_pty::CommandBuilder;

pub struct SSHCommandBuilder {
    cmd: CommandBuilder,
}

impl SSHCommandBuilder {
    pub fn new() -> Self {
        let mut cmd = CommandBuilder::new("ssh");
        cmd.arg("-tt");
        cmd.env("TERM", "xterm-256color");

        Self { cmd }
    }

    pub fn arg(&mut self, val: impl Into<String>) {
        self.cmd.arg(val.into());
    }

    pub fn option(&mut self, key: &str, value: impl Into<String>) {
        self.cmd.arg("-o");
        self.cmd.arg(format!("{}={}", key, value.into()));
    }

    pub fn build(self) -> CommandBuilder {
        self.cmd
    }
}