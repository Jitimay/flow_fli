#!/bin/bash

# This script stops all FlowFli services started with start.sh.

echo "--- Stopping all FlowFli services ---"

# Get the absolute path of the script's directory
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PID_DIR="$SCRIPT_DIR/.pids"

# Function to kill a process by PID file
kill_process() {
    local pid_file=$1
    local service_name=$2

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null; then
            echo "Stopping $service_name (PID: $pid)..."
            # Kill the entire process group to stop child processes spawned by shells
            kill -9 -$pid 2>/dev/null || kill -9 $pid 2>/dev/null
        else
            echo "$service_name (PID: $pid) is not running."
        fi
        rm -f "$pid_file"
    else
        echo "$service_name PID file not found, may have already been stopped."
    fi
}

# Kill each service using its PID file
kill_process "$PID_DIR/sensors.pid" "Sensor Simulator"
kill_process "$PID_DIR/backend.pid" "Backend API"
kill_process "$PID_DIR/agent.pid" "Agent"
kill_process "$PID_DIR/dashboard.pid" "Dashboard"

# A more aggressive cleanup for any orphaned processes
# This is useful because 'npm run' can spawn complex process trees

echo "Cleaning up any remaining orphaned processes..."
# Kill the flask server
pkill -f "flask run"
# Kill the node development servers
pkill -f "ts-node-dev.*src/server.ts"
pkill -f "ts-node-dev.*src/index.ts"
# Kill the react development server
pkill -f "react-scripts start"


# Remove the PID directory if it's empty
rmdir "$PID_DIR" 2>/dev/null

echo "--- All services stopped. ---"