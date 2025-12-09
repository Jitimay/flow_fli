# FlowFli Agent Tokenization Platform (ATP) Integration Guide

This document outlines the conceptual integration of the FlowFli Agent with the Agent Tokenization Platform (ATP), a hypothetical platform for tokenizing autonomous agent actions and value.

## 1. Detailed Steps to Deploy the Agent to ATP

Deploying the FlowFli Agent to the ATP involves packaging the agent's code, defining its operational parameters and tokenomics, and registering it with the platform.

1.  **Agent Code Preparation:**
    *   Ensure your `flowfli-agent` directory is clean and contains all necessary code (`src/`, `package.json`, `tsconfig.json`).
    *   Build the agent into a deployable JavaScript bundle. While ADK-TS typically handles this, for a Node.js/TypeScript agent, this usually involves compiling TypeScript to JavaScript:
        ```bash
        cd flowfli/agent
        npm install
        npm run build # (Assuming you add a build script in package.json: "build": "tsc")
        ```
    *   The ATP expects a defined entry point for the agent's execution (e.g., `dist/index.js`).

2.  **ATP Configuration File (`atp.config.json`):**
    *   Create a JSON file that describes your agent to the ATP. This file defines the agent's capabilities, resource requirements, and how its actions contribute to the tokenized economy.

3.  **Upload to ATP:**
    *   Utilize the ATP CLI or web interface to upload your agent's compiled bundle and the `atp.config.json` file.
    *   Example CLI command (hypothetical):
        ```bash
        atp-cli deploy --agent-name "FlowFliWaterAgent" --path "./flowfli/agent/dist" --config "./flowfli/agent/atp.config.json"
        ```

4.  **Verification and Activation:**
    *   The ATP platform will verify the agent's code and configuration.
    *   Once verified, you can activate the agent through the ATP dashboard, making it operational within the tokenized ecosystem.

## 2. JSON Configuration for ATP (`atp.config.json` Example)

This configuration defines the FlowFli Agent's identity, operational parameters, and how it interacts with the ATP for tokenization.

```json
{
  "agentName": "FlowFliWaterAgent",
  "description": "An autonomous AI agent for intelligent water management, integrating IoT sensors, payment validation, and pump control.",
  "version": "1.0.0",
  "author": "FlowFli Team",
  "runtime": "node_v16",
  "entryPoint": "dist/index.js",
  "resources": {
    "cpuUnits": 2,
    "memoryMB": 512,
    "networkBandwidthMbps": 10
  },
  "tools": [
    {
      "name": "validatePayment",
      "description": "Validates a user payment and checks for fraud.",
      "schema": {
        "type": "object",
        "properties": {
          "amount": { "type": "number", "description": "The payment amount." },
          "source": { "type": "string", "description": "The source of the payment." }
        },
        "required": ["amount", "source"]
      },
      "tokenCostEstimation": {
        "baseCostIQ": 50,
        "variables": [
          {"name": "amount", "factorIQ": 5}
        ]
      }
    },
    {
      "name": "activatePump",
      "description": "Activates the water pump for a specified duration.",
      "schema": {
        "type": "object",
        "properties": {
          "duration": { "type": "number", "description": "Duration in seconds." }
        },
        "required": ["duration"]
      },
      "tokenCostEstimation": {
        "baseCostIQ": 20,
        "variables": [
          {"name": "duration", "factorIQ": 1}
        ]
      }
    },
    {
      "name": "readSensorValues",
      "description": "Reads current water sensor data.",
      "schema": {
        "type": "object",
        "properties": {}
      },
      "tokenCostEstimation": {
        "baseCostIQ": 5
      }
    }
  ],
  "eventLogging": {
    "logLevelsToMonitor": ["info", "warn", "error"],
    "keywordsForOnChainEntry": [
      "Payment successful",
      "Fraud detected",
      "Pump activated",
      "Pump deactivated",
      "Water level low"
    ]
  },
  "rewards": {
    "successfulPaymentValidationIQ": 100,
    "successfulPumpActivationIQ": 50,
    "fraudDetectionBonusIQ": 200
  },
  "security": {
    "requiredPermissions": [
      "network.outbound.http",
      "agent.log.read"
    ]
  }
}
```

## 3. IQ Token Estimation

The ATP facilitates a tokenized economy using "IQ Tokens". For the FlowFli Agent, IQ token estimation is determined by:

*   **Base Cost per Operation:** Each tool call has a base cost in IQ tokens (e.g., `readSensorValues` is 5 IQ). This covers the computational resources used by the ATP to execute the tool.
*   **Variable Cost:** Certain operations have variable costs tied to their parameters. For instance, `validatePayment` might have a factor related to the transaction `amount`, where larger amounts incur a slightly higher IQ cost to reflect increased value or processing complexity. `activatePump` costs increase with `duration`.
*   **Rewards:** The agent can earn IQ tokens for successfully completing valuable tasks, such as:
    *   Successfully validating a payment.
    *   Successfully activating the pump after a validated payment.
    *   Detecting and flagging fraudulent transactions.

The `tokenCostEstimation` and `rewards` fields in the `atp.config.json` define these parameters. ATP will use these to calculate the net IQ token change for the agent's account.

## 4. Instructions for Launching Without Writing a Smart Contract

The ATP is designed to abstract away the complexities of blockchain interaction for agent developers. You do **not** need to write a smart contract for your FlowFli Agent to operate and integrate with the tokenized economy.

*   **ATP Handles Contracts:** The ATP platform provides standardized smart contracts that manage agent registration, token transfers (for costs and rewards), and on-chain event logging.
*   **Configuration-Driven:** Your `atp.config.json` file acts as the "contract" for your agent, defining its behavior and economic interactions within the ATP ecosystem. The platform translates this configuration into interactions with its underlying smart contracts.
*   **Focus on Agent Logic:** This allows developers to focus purely on the agent's business logic (water management in this case) without needing deep blockchain development expertise.

## 5. Explanation How Logs Become On-Chain Entries

The ATP monitors the standard output (stdout/stderr) and specific log events generated by your FlowFli Agent. Certain log messages, as defined in the `eventLogging` section of your `atp.config.json`, are automatically processed and translated into on-chain entries.

1.  **Log Monitoring:** The ATP runtime environment continuously monitors the agent's log output.
2.  **Keyword Matching:** When a log message contains a `keyword` specified in `eventLogging.keywordsForOnChainEntry`, the ATP flags this event.
3.  **Hashing and Metadata:** The platform takes the relevant log entry (or a hash of it) and any associated metadata (timestamp, agent ID, event type) and prepares it for an on-chain transaction.
4.  **Transaction Submission:** The ATP's internal infrastructure then submits a transaction to the underlying blockchain. This transaction records a immutable, timestamped entry representing the agent's action or state change.
5.  **Transparency and Auditability:** These on-chain entries provide a transparent and auditable history of the agent's significant activities, which can be crucial for dispute resolution, performance auditing, and demonstrating the agent's value within the tokenized system.

**Example Log-to-Chain Flow:**

*   **Agent Log:** `[INFO] [2025-12-09T14:30:00Z] Payment successful. Transaction ID: txn_12345`
*   **ATP Action:** Detects "Payment successful".
*   **On-Chain Entry:** A transaction is recorded on the blockchain, containing:
    *   Agent ID: `FlowFliWaterAgent`
    *   Event Type: `payment_processed`
    *   Timestamp: `2025-12-09T14:30:00Z`
    *   Data Hash: `sha256(txn_12345)` (or direct storage of the transaction ID, depending on chain capabilities)
