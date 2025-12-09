#!/bin/bash

echo "🚀 Starting FlowFli - IQAI Agent Arena Demo"
echo "=========================================="

# Create logs directory
mkdir -p logs

# Start Sensor Simulator
echo "1️⃣ Starting Sensor Simulator (Python Flask)..."
cd sensors
source ../venv/bin/activate
python sensor_simulator.py > ../logs/sensors.log 2>&1 &
SENSOR_PID=$!
cd ..

# Start Backend API
echo "2️⃣ Starting Backend API (Node.js)..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start ADK-TS Agent
echo "3️⃣ Starting ADK-TS Agent..."
cd agent
npm run dev > ../logs/agent.log 2>&1 &
AGENT_PID=$!
cd ..

# Start Main Dashboard
echo "4️⃣ Starting Main Dashboard..."
cd simple-dashboard
python3 -m http.server 3001 > ../logs/dashboard.log 2>&1 &
DASHBOARD_PID=$!

# Start Blockchain Demo
echo "5️⃣ Starting Blockchain Demo..."
python3 -m http.server 3002 > ../logs/blockchain.log 2>&1 &
BLOCKCHAIN_PID=$!
cd ..

echo ""
echo "🎉 FlowFli System Started Successfully!"
echo "======================================"
echo "📊 Main Dashboard:     http://localhost:3001"
echo "🔗 Blockchain Demo:    http://localhost:3002/blockchain.html"
echo "🔧 Backend API:        http://localhost:3000"
echo "📡 Sensor Data:        http://localhost:5000/sensors"
echo ""
echo "📝 View Logs:"
echo "   tail -f logs/sensors.log"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/agent.log"
echo ""
echo "🛑 To stop: ./stop.sh"
echo ""
echo "🏆 READY FOR IQAI AGENT ARENA JUDGING!"

# Save PIDs for stop script
echo "$SENSOR_PID $BACKEND_PID $AGENT_PID $DASHBOARD_PID $BLOCKCHAIN_PID" > .pids
