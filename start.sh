#!/bin/bash

# This script starts all FlowFli services in the background.

echo "--- Starting all FlowFli services ---"

# Get the absolute path of the script's directory
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Create a logs directory if it doesn't exist
mkdir -p "$SCRIPT_DIR/logs"
# Create a directory to store process IDs (PIDs)
mkdir -p "$SCRIPT_DIR/.pids"

# Clean up old logs and PID files
rm -f "$SCRIPT_DIR/logs/*.log"
rm -f "$SCRIPT_DIR/.pids/*.pid"

# 1. Start Sensor Simulator (Python/Flask)
echo "Starting Sensor Simulator... View logs with: tail -f logs/sensors.log"
(
  cd "$SCRIPT_DIR/sensors" &&
  # Ensure the virtual environment exists
  if [ ! -d "venv" ]; then
      echo "ERROR: Python virtual environment not found in 'sensors/'. Please run the installation steps first."
      exit 1
  fi
  source venv/bin/activate &&
  FLASK_APP=sensor_simulator.py flask run --port=5000 >> "$SCRIPT_DIR/logs/sensors.log" 2>&1 &
  echo $! > "$SCRIPT_DIR/.pids/sensors.pid"
)

# Wait a moment for the sensor service to initialize
sleep 3

# 2. Start Backend API (Node.js)
echo "Starting Backend API... View logs with: tail -f logs/backend.log"
(
  cd "$SCRIPT_DIR/backend" &&
  npm run dev >> "$SCRIPT_DIR/logs/backend.log" 2>&1 &
  # The actual process is often a child of the npm script, so we find it and store its PID
  pgrep -f "ts-node-dev.*src/server.ts" > "$SCRIPT_DIR/.pids/backend.pid"
)

# Wait a moment for the backend to initialize
sleep 5

# 3. Start Agent (Node.js)
echo "Starting ADK-TS Agent... View logs with: tail -f logs/agent.log"
(
  cd "$SCRIPT_DIR/agent" &&
  npm run dev >> "$SCRIPT_DIR/logs/agent.log" 2>&1 &
  pgrep -f "ts-node-dev.*src/index.ts" > "$SCRIPT_DIR/.pids/agent.pid"
)

# 4. Start Dashboard (React)
DASHBOARD_DIR="$SCRIPT_DIR/dashboard"
if [ -d "$DASHBOARD_DIR" ]; then
    # Check if node_modules exists
    if [ ! -d "$DASHBOARD_DIR/node_modules" ]; then
        echo "------------------------------------------------------------------"
        echo "WARNING: Dashboard dependencies not found in 'dashboard/node_modules'."
        echo "Please run 'npm install' inside the 'flowfli/dashboard' directory first."
        echo "------------------------------------------------------------------"
    else
        echo "Starting Web Dashboard... View logs with: tail -f logs/dashboard.log"
        (
            cd "$DASHBOARD_DIR" &&
            npm start >> "$SCRIPT_DIR/logs/dashboard.log" 2>&1 &
            echo $! > "$SCRIPT_DIR/.pids/dashboard.pid" # npm start PID is sufficient here
        )
    fi
else
  echo "WARNING: Dashboard directory 'dashboard/' not found. This should not happen."
fi

echo -e "\n--- All services launched. ---"
echo "NOTE: It may take a moment for all services to become fully active."
echo "Use 'tail -f logs/<service>.log' to see the output of a specific service."
echo "Run './stop.sh' to stop all services."