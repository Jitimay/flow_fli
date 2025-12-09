# FlowFli System Architecture

This document outlines the architecture of the FlowFli system, an autonomous water management agent.

## 1. High-Level Architecture Diagram

The system is composed of several microservices and components that communicate with each other via REST APIs and serial communication.

```ascii
+----------------------+   (HTTP)   +------------------+   (HTTP)   +---------------------+
|                      | <--------> |                  | <--------> |                     |
|   Web Dashboard (UI) |            |   Backend API    |            | Sensor Simulator    |
|   (React/JS)         |            | (Node.js/Express)|            | (Python/Flask)      |
|                      | <--------> |                  | ---------> |                     |
+----------------------+   (HTTP)   +------------------+            +---------------------+
       ^                                      | (HTTP)
       |                                      |
       | (User Interaction)                   v
       |                             +------------------+
       |                             |                  |
       +---------------------------+ |   ADK-TS Agent   |
                                   | |     (Node.js)    |
     (Purchase Water Button)       | |                  |
                                   +------------------+
                                             |
                                             | (Serial or HTTP)
                                             v
+----------------------+            +------------------+
|                      |            |                  |
| Payment Processor    | <--------> |   Pump Controller|
|  (Mock API)          |  (Logic)   |    (Arduino)     |
|                      |            |                  |
+----------------------+            +------------------+

```

## 2. Component Descriptions

### 2A. ADK-TS Autonomous Agent
-   **Technology:** Node.js/TypeScript, based on a mocked "ADK-TS" framework.
-   **Description:** The core logic unit of the system. The agent runs a continuous reasoning loop to monitor the system, make decisions, and execute tasks. It is responsible for deciding when to activate the pump based on sensor readings and payment validations.
-   **Key Features:**
    -   **Reasoning Loop:** Continuously fetches data from sensors and decides on actions.
    -   **Tooling:** Utilizes tools to interact with other system components (e.g., `paymentTool`, `pumpTool`).
    -   **Task Execution:** Can be tasked to perform specific actions like `validatePayment` or `activatePump`.
    -   **ATP Integration:** Designed to have its logs and actions tokenized on the Agent Tokenization Platform.

### 2B. Backend API
-   **Technology:** Node.js/Express.
-   **Description:** The central hub for communication. It exposes endpoints for the dashboard, agent, and other services to interact with the system's core functionalities.
-   **Endpoints:**
    -   `POST /payment/process`: Processes a payment through a mock payment gateway.
    -   `POST /pump/activate`: Sends a command to the Arduino pump controller.
    -   `GET /sensor/read`: Reads data from the sensor simulator.
    -   `GET /logs`: Retrieves system event logs.
-   **Business Logic:** Contains logic for payment processing, fraud detection, and orchestrating hardware interactions.

### 2C. Pump Controller
-   **Technology:** C++ on Arduino (Mega/Nano).
-   **Description:** The hardware interface responsible for controlling the physical water pump. It listens for commands from the backend API.
-   **Communication:** Communicates with the backend via Serial communication. The backend uses a library like `serialport` to send commands. A REST-based alternative could be implemented if using an ESP32/ESP8266.
-   **Functionality:** Activates or deactivates a relay connected to the pump motor based on commands.

### 2D. Sensor Simulator
-   **Technology:** Python/Flask.
-   **Description:** A mock IoT sensor service that generates realistic, fluctuating data for water level, flow rate, and pump vibration.
-   **API:** Exposes a `GET /sensors` endpoint that the backend can call to get the latest simulated sensor values. This allows for development and testing without physical hardware.

### 2E. Web Dashboard
-   **Technology:** React/TypeScript.
-   **Description:** A user-facing interface to monitor and interact with the FlowFli system.
-   **Features:**
    -   Displays real-time sensor data (e.g., in charts).
    -   Shows pump status (On/Off).
    -   Provides a log of agent actions and system events.
    -   Includes a "Purchase Water" button to initiate a test transaction.
-   **Data Flow:** The dashboard polls the backend API at regular intervals to fetch the latest state and sensor data.

### 2F. Payment Processor & Fraud Detection
-   **Technology:** Integrated within the Backend API (Node.js).
-   **Description:** A mock payment gateway that simulates payment validation. It includes a fraud detection module that analyzes transaction patterns to flag suspicious activity (e.g., multiple rapid transactions from the same source).

### 2G. Logging & Event History
-   **Technology:** Integrated within the Backend API (Node.js).
-   **Description:** A simple logging mechanism that records key system events (e.g., payment processed, pump activated, fraud detected). Logs are stored in memory or a file and can be retrieved via the `GET /logs` endpoint. These logs are the basis for on-chain entries in the ATP integration.

### 2H. ATP Integration Workflow
-   **Description:** The agent is designed to be deployed on the Agent Tokenization Platform (ATP). The workflow involves:
    1.  **Packaging:** The agent's TypeScript code is bundled into a deployable package.
    2.  **Configuration:** A `atp.config.json` file defines the agent's tools, required resources, and tokenomics (IQ token estimation).
    3.  **Deployment:** The package is uploaded to the ATP.
    4.  **Tokenization:** The ATP platform monitors the agent's log output. Key events (defined in the config) are hashed and recorded on-chain, creating an immutable history of the agent's actions.
