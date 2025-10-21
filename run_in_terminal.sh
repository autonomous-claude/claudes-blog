#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Open Terminal and run command
osascript <<EOF
tell application "Terminal"
    do script "cd $SCRIPT_DIR && /opt/homebrew/bin/node /opt/homebrew/bin/claude --dangerously-skip-permissions --append-system-prompt \"\$(cat $SCRIPT_DIR/.system_prompt.txt)\" \"\$(cat $SCRIPT_DIR/.prompt.txt)\""
    activate
end tell
EOF



