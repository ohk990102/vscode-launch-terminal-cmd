import * as vscode from 'vscode';
import * as net from 'net';
import * as crypto from 'crypto';

enum LaunchType {
	LAUNCH_NEW_WINDOW = 0,
	LAUNCH_SPLIT_WINDOW = 1,
}

const options = {
	'max_read': 1024,
	'launch_type': LaunchType.LAUNCH_SPLIT_WINDOW,
};

let server: net.Server;

async function createNewSplitTerminal(): Promise<vscode.Terminal> {
    return new Promise(async (resolve, reject) => {
      await vscode.commands.executeCommand("workbench.action.terminal.split");

      vscode.window.onDidChangeActiveTerminal((terminal) => {
        if (terminal) {
          resolve(terminal);
        }
      });
	});
  }

async function createNewTerminal(): Promise<vscode.Terminal> {
	return new Promise(async (resolve, reject) => {
		resolve(vscode.window.createTerminal());
	});
}

export function activate(context: vscode.ExtensionContext) {
	server = net.createServer((c) => {
		c.setEncoding('utf8');
		c.on('data', (data: string) => {
			if (data.length > options.max_read) {
				data = data.slice(0, options.max_read);
			}
			
			if (options.launch_type === LaunchType.LAUNCH_SPLIT_WINDOW) {
				createNewSplitTerminal().then((terminal) => {
					terminal.sendText(data, true);
				});
			}
			else if (options.launch_type === LaunchType.LAUNCH_NEW_WINDOW) {
				createNewTerminal().then((terminal) => {
					terminal.sendText(data, true);
				});
			}
			c.end();
		});
	});
	server.on('error', (err) => {
		console.log('Error: ' + err);
	});

	let salt = crypto.randomBytes(6).toString('hex');
	let sockname = `/tmp/vscode-launch-terminal-cmd-${salt}.sock`;
	server.listen(sockname, () => {
		console.log(`listening on ${sockname}`);
	});
	
	vscode.window.onDidOpenTerminal((terminal) => {
		terminal.sendText(`export VSCODE_TERMINAL_SOCKET=${sockname}`);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
	server.close();
}
