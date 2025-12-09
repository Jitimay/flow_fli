import time
import random
from datetime import datetime
from flask import Flask, jsonify

app = Flask(__name__)

# --- Sensor State Simulation ---
# These are the base values for our sensors.
state = {
    "water_level": 1.0,  # Starting at 100% full
    "flow_rate": 0.0,
    "vibration": 5.0,
    "is_pump_active": False,
    "pump_stop_time": 0
}

def update_sensors():
    """
    Simulates changes in sensor data over time.
    """
    global state
    now = time.time()

    # --- Pump Logic ---
    if state["is_pump_active"] and now >= state["pump_stop_time"]:
        state["is_pump_active"] = False
        state["flow_rate"] = 0.0
        state["vibration"] = 5.0 + random.uniform(-0.5, 0.5) # Vibration drops to idle

    # --- Water Level Logic ---
    if state["is_pump_active"]:
        # Water level decreases when pump is on
        state["water_level"] -= 0.01 # Decrease by 1% per update cycle
        if state["water_level"] < 0:
            state["water_level"] = 0
            
        # Simulate active pump metrics
        state["flow_rate"] = 20.5 + random.uniform(-1.5, 1.5) # L/min
        state["vibration"] = 30.0 + random.uniform(-2.5, 2.5) # Hz
    else:
        # Water level slowly refills when pump is off (simulating a reservoir)
        if state["water_level"] < 1.0:
            state["water_level"] += 0.002
        if state["water_level"] > 1.0:
            state["water_level"] = 1.0

        # Idle metrics
        state["flow_rate"] = 0.0
        state["vibration"] = 5.0 + random.uniform(-0.5, 0.5)

@app.route('/sensors', methods=['GET'])
def get_sensor_data():
    """
    Returns the current simulated sensor data.
    """
    update_sensors()
    return jsonify({
        "waterLevel": round(state["water_level"], 4),
        "flowRate": round(state["flow_rate"], 2),
        "vibration": round(state["vibration"], 2),
        "timestamp": datetime.utcnow().isoformat() + 'Z'
    })

@app.route('/mock/pump/activate', methods=['POST'])
def mock_activate_pump():
    """
    A mock endpoint for the backend to "virtually" activate the pump in the simulator.
    This helps in keeping the simulation state consistent.
    NOTE: This is for simulation purposes. The real backend talks to the Arduino.
    """
    global state
    duration = 10 # Default duration if not specified
    try:
        data = request.get_json()
        duration = int(data.get('duration', 10))
    except:
        pass # Ignore errors and use default

    if not state["is_pump_active"]:
        state["is_pump_active"] = True
        state["pump_stop_time"] = time.time() + duration
        return jsonify({"success": True, "message": f"Simulator pump activated for {duration}s."})
    else:
        return jsonify({"success": False, "message": "Simulator pump is already active."})


if __name__ == '__main__':
    # It's better to run flask with the `flask run` command.
    # `python sensor_simulator.py` is for basic testing.
    # Use: FLASK_APP=sensor_simulator.py flask run
    app.run(host='0.0.0.0', port=5000)
