import { Router } from 'express';
import axios from 'axios';
import { PaymentService } from '../services/payment.service';
import { PumpService } from '../services/pump.service';

const router = Router();
const paymentService = new PaymentService();
const pumpService = new PumpService();

const SENSOR_SIMULATOR_URL = 'http://localhost:5000/sensors';

// In-memory log storage
let systemLogs: any[] = [];
const log = (level: string, message: string, data?: any) => {
    const logEntry = { timestamp: new Date().toISOString(), level, message, data };
    console.log(`[API] ${message}`, data || '');
    systemLogs.push(logEntry);
    // Prune logs to prevent memory overflow
    if (systemLogs.length > 100) {
        systemLogs = systemLogs.slice(systemLogs.length - 100);
    }
};


// --- API Endpoints ---

/**
 * POST /payment/process
 * Processes a payment for water.
 * Body: { amount: number, source: string }
 */
router.post('/payment/process', (req, res) => {
    const { amount, source } = req.body;

    if (typeof amount !== 'number' || typeof source !== 'string') {
        log('warn', 'Invalid payment request payload', req.body);
        return res.status(400).json({ success: false, message: 'Invalid payload. Required: { amount: number, source:string }' });
    }

    log('info', 'Processing payment', { amount, source });
    const result = paymentService.processPayment(amount, source);
    
    if (result.success) {
        log('info', 'Payment successful', result);
    } else {
        log('warn', 'Payment failed or flagged', result);
    }

    res.status(result.success ? 200 : 400).json(result);
});

/**
 * POST /pump/activate
 * Activates the water pump.
 * Body: { duration: number }
 */
router.post('/pump/activate', async (req, res) => {
    const { duration } = req.body;

    if (typeof duration !== 'number' || duration <= 0) {
        log('warn', 'Invalid pump activation request', req.body);
        return res.status(400).json({ success: false, message: 'Invalid payload. Required: { duration: number > 0 }' });
    }
    
    log('info', `Activating pump for ${duration} seconds`);
    const result = await pumpService.activatePump(duration);

    if(result.success) {
        log('info', 'Pump activation command sent', result);
    } else {
        log('error', 'Pump activation failed', result);
    }

    res.status(result.success ? 200 : 500).json(result);
});

/**
 * GET /sensor/read
 * Reads data from the sensor simulator.
 */
router.get('/sensor/read', async (req, res) => {
    try {
        const response = await axios.get(SENSOR_SIMULATOR_URL);
        // log('info', 'Sensor data retrieved', response.data);
        res.json(response.data);
    } catch (error) {
        log('error', 'Failed to fetch data from sensor simulator', { error: (error as Error).message });
        res.status(500).json({ success: false, message: 'Could not connect to sensor simulator.' });
    }
});

/**
 * GET /logs
 * Retrieves the latest system logs.
 */
router.get('/logs', (req, res) => {
    res.json(systemLogs);
});

export default router;
