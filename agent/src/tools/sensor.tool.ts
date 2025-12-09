import axios from 'axios';
import { SensorData } from '../types';

const BACKEND_API_URL = 'http://localhost:3000/api';

export class SensorTool {
  /**
   * Reads the latest sensor values from the backend API.
   * @returns {Promise<SensorData>} A promise that resolves with the sensor data.
   */
  async readSensorValues(): Promise<SensorData> {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/sensor/read`);
      return response.data;
    } catch (error) {
      console.error('Error reading sensor values:', error);
      throw new Error('Failed to read sensor values.');
    }
  }
}
