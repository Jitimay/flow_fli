import { SensorTool } from './tools/sensor.tool';
import { PaymentTool } from './tools/payment.tool';
import { PumpTool } from './tools/pump.tool';
import { AgentTask, AgentLog, SensorData, PaymentValidationResponse, PumpActivationResponse } from './types';

// Mock ADK-TS Logger
class Logger {
    private logs: AgentLog[] = [];

    log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
        const logEntry: AgentLog = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data
        };
        this.logs.push(logEntry);
        console.log(`[${logEntry.timestamp}] [${level.toUpperCase()}] ${message}`, data || '');
        // In a real ATP integration, this would be emitted to the ATP platform
    }

    getLogs() {
        return this.logs;
    }
}

export class FlowFliAgent {
    private sensorTool: SensorTool;
    private paymentTool: PaymentTool;
    private pumpTool: PumpTool;
    private logger: Logger;
    private tasks: AgentTask[] = [];
    private reasoningInterval: NodeJS.Timeout | null = null;
    private isPumpActive: boolean = false;

    constructor() {
        this.sensorTool = new SensorTool();
        this.paymentTool = new PaymentTool();
        this.pumpTool = new PumpTool();
        this.logger = new Logger();
    }

    /**
     * Starts the agent's reasoning loop.
     */
    start() {
        this.logger.log('info', 'FlowFli Agent starting...');
        this.reasoningInterval = setInterval(() => this.reasoningLoop(), 5000); // Loop every 5 seconds
        this.logger.log('info', 'Reasoning loop started.');
    }

    /**
     * Stops the agent's reasoning loop.
     */
    stop() {
        if (this.reasoningInterval) {
            clearInterval(this.reasoningInterval);
            this.logger.log('info', 'FlowFli Agent stopped.');
        }
    }

    /**
     * The core reasoning loop of the agent.
     * It reads sensor data and makes decisions.
     */
    private async reasoningLoop() {
        this.logger.log('info', 'Executing reasoning loop...');
        try {
            const sensorData = await this.readSensorValues();
            this.logger.log('info', 'Sensor data received', sensorData);

            // Example decision logic:
            if (sensorData.waterLevel < 0.2 && !this.isPumpActive) {
                this.logger.log('warn', 'Water level is low, but no payment received to activate pump.');
            }

            if (this.isPumpActive && sensorData.flowRate === 0) {
                 this.logger.log('error', 'Pump is active but flow rate is zero! Potential issue.', {sensorData});
            }

        } catch (error) {
            this.logger.log('error', 'Error in reasoning loop', { error });
        }
    }
    
    /**
     * Adds a task to the agent's queue.
     * @param taskName The name of the task to execute.
     * @param params The parameters for the task.
     */
    public async runTask(taskName: AgentTask['name'], params: Record<string, any>): Promise<any> {
        const task: AgentTask = {
            id: `task_${Date.now()}`,
            name: taskName,
            params,
            status: 'in-progress'
        };
        this.tasks.push(task);
        this.logger.log('info', `Running task: ${task.name}`, task.params);

        try {
            let result;
            switch (task.name) {
                case 'validatePayment':
                    result = await this.validatePayment(params.amount, params.source);
                    // If payment is valid, activate the pump
                    if(result.success) {
                        const pumpDuration = this.calculatePumpDuration(params.amount);
                        await this.activatePump(pumpDuration);
                    }
                    break;
                case 'activatePump':
                    result = await this.activatePump(params.duration);
                    break;
                case 'readSensorValues':
                    result = await this.readSensorValues();
                    break;
                default:
                    throw new Error(`Unknown task: ${task.name}`);
            }
            task.status = 'completed';
            task.result = result;
            this.logger.log('info', `Task ${task.name} completed successfully.`, result);
            return result;
        } catch (error) {
            task.status = 'failed';
            this.logger.log('error', `Task ${task.name} failed.`, { error });
            throw error;
        }
    }

    private calculatePumpDuration(amount: number): number {
        // Example logic: 1 dollar = 10 seconds of water
        const duration = amount * 10;
        this.logger.log('info', `Calculated pump duration: ${duration}s for amount: $${amount}`);
        return duration;
    }

    private async validatePayment(amount: number, source: string): Promise<PaymentValidationResponse> {
        const response = await this.paymentTool.validatePayment(amount, source);
        if(response.fraudDetected) {
            this.logger.log('warn', 'Fraud detected during payment validation.', response);
        }
        return response;
    }

    private async activatePump(duration: number): Promise<PumpActivationResponse> {
        this.isPumpActive = true;
        const response = await this.pumpTool.activatePump(duration);
        setTimeout(() => { this.isPumpActive = false; }, duration * 1000);
        return response;
    }

    private async readSensorValues(): Promise<SensorData> {
        return await this.sensorTool.readSensorValues();
    }
}
