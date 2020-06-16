# launch-terminal-cmd

## Features

Opens a named socket that recv command and execute in new terminal. 
Environment variable with name `VSCODE_TERMINAL_SOCKET` will be set to the listening socket. 

## Extension Settings
This extension contributes the following settings:

* `launch-terminal-cmd.defaultLaunchType`: Defines way to open up a terminal. 
    * `split`: Opens a terminal by splitting active terminal window. 
    * `new`: Opens a new terminal. 

## Release Notes

### 0.0.1
initial release

### 0.0.2
fix bug

## Working with pwntools
I made this extension to use pwntools gdb.attach feature with vscode terminal. 

For this, you can use following shell script. 
```bash
#! /bin/bash

if [ -z "${VSCODE_TERMINAL_SOCKET}" ]
then
    echo "Extension not installed"
    exit 1;
fi

echo "$*" | nc -U ${VSCODE_TERMINAL_SOCKET}
```

Put this file on somewhere (ex: `~/vscode-terminal`), and change your exploit code like this. 

```python
from pwn import *

context.terminal = ["/home/ohk990102/vscode-terminal"]

p = process('vm')
gdb.attach(p)

# ...
```

Happy pwning!!