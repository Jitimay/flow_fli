import { FlowFliAgent } from './agent';

const agent = new FlowFliAgent();

// Start the agent's autonomous reasoning loop
agent.start();

// --- Example Task Execution ---
// This demonstrates how an external trigger (like a message queue or API call)
// could command the agent to perform a specific task.

async function runDemoTasks() {
    console.log('\n--- Running Demo Tasks ---');
    
    // Example 1: A legitimate water purchase
    try {
        console.log('\n[TASK] Simulating a valid $2.50 water purchase...');
        const paymentResult = await agent.runTask('validatePayment', { amount: 2.50, source: 'dashboard-user-123' });
        console.log('Payment validation and pump activation sequence finished.');
    } catch (error) {
        console.error('Demo Task 1 Failed:', (error as Error).message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s for pump to finish

    // Example 2: A fraudulent water purchase
    try {
        console.log('\n[TASK] Simulating a fraudulent $0.01 water purchase (will be flagged)...');
        await agent.runTask('validatePayment', { amount: 0.01, source: 'suspicious-source-789' });
    } catch (error) {
        console.error('Demo Task 2 Failed as expected:', (error as Error).message);
    }

     await new Promise(resolve => setTimeout(resolve, 5000));

    // Example 3: Manually reading sensor values
    try {
        console.log('\n[TASK] Manually triggering a sensor read...');
        const sensorData = await agent.runTask('readSensorValues', {});
        console.log('Manual sensor read successful:', sensorData);
    } catch (error) {
        console.error('Demo Task 3 Failed:', (error as Error).message);
    }
}

// Wait a few seconds for the agent to initialize before running tasks
setTimeout(runDemoTasks, 3000);

process.on('SIGINT', () => {
    agent.stop();
    process.exit(0);
});
