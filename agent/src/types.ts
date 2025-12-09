export interface SensorData {
  waterLevel: number; // in meters
  flowRate: number; // in liters per minute
  vibration: number; // in Hz
  timestamp: string;
}

export interface PaymentValidationResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  fraudDetected: boolean;
}

export interface PumpActivationResponse {
  success: boolean;
  message: string;
}

export interface AgentTask {
  id: string;
  name: 'validatePayment' | 'activatePump' | 'readSensorValues';
  params: Record<string, any>;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  result?: any;
}

export interface AgentLog {
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    data?: any;
}
