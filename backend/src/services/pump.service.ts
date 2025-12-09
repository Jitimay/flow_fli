import { SerialPort } from 'serialport';

// IMPORTANT: Replace with your Arduino's serial port.
// Find it with `npx @serialport/list` or `arduino-cli board list`.
const ARDUINO_SERIAL_PORT = process.env.ARDUINO_SERIAL_PORT || '/dev/ttyACM0'; // or 'COM3' on Windows

export class PumpService {
  private serialPort: SerialPort;
  private isPortOpen = false;

  constructor() {
    // In a real-world scenario, you might not want to auto-connect
    // or you might have more robust error handling and reconnection logic.
    this.serialPort = new SerialPort({
      path: ARDUINO_SERIAL_PORT,
      baudRate: 9600
    }, (err) => {
        if (err) {
            console.error(`[PumpService] Error opening serial port ${ARDUINO_SERIAL_PORT}: ${err.message}`);
            console.warn(`[PumpService] Pump hardware is not connected. Running in mock mode.`);
            this.isPortOpen = false;
        } else {
            console.log(`[PumpService] Serial port ${ARDUINO_SERIAL_PORT} opened successfully.`);
            this.isPortOpen = true;
        }
    });

    this.serialPort.on('data', (data) => {
        console.log(`[Arduino] Recieved: ${data.toString()}`);
    });
  }

  /**
   * Activates the pump by sending a command over the serial port.
   * @param duration The duration in seconds to run the pump.
   * @returns A promise that resolves with a success or error message.
   */
  public activatePump(duration: number): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      if (!this.isPortOpen) {
        // Mock mode if hardware is not connected
        console.log(`[PumpService] MOCK MODE: Simulating pump activation for ${duration} seconds.`);
        setTimeout(() => {
            console.log(`[PumpService] MOCK MODE: Pump has finished its cycle.`);
        }, duration * 1000);

        resolve({
          success: true,
          message: `Pump activated in mock mode for ${duration} seconds.`,
        });
        return;
      }
      
      const command = `ACTIVATE,${duration}\n`; // Command format: ACTIVATE,<duration> 
      
      this.serialPort.write(command, (err) => {
        if (err) {
          console.error('[PumpService] Error writing to serial port:', err.message);
          resolve({
            success: false,
            message: 'Failed to send command to pump hardware.',
          });
        } else {
          console.log(`[PumpService] Sent command to pump: ${command.trim()}`);
          resolve({
            success: true,
            message: `Pump activated for ${duration} seconds.`,
          });
        }
      });
    });
  }
}
