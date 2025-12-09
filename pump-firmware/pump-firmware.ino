/*
  FlowFli Pump Controller Firmware
  
  This sketch listens for commands over the serial port to control a water pump
  connected via a relay.
  
  - Connect a relay module's signal pin to PUMP_RELAY_PIN.
  - The relay should be a 5V relay that can be triggered by a HIGH signal.
  - The relay will control the power to the water pump.
  
  Serial Commands:
  - "ACTIVATE,<duration>" : Activates the pump for <duration> seconds.
    Example: "ACTIVATE,15" turns the pump on for 15 seconds.
*/

// --- CONFIGURATION ---
const int PUMP_RELAY_PIN = 7; // Digital pin connected to the relay signal pin
const long SERIAL_BAUD_RATE = 9600;

// --- STATE VARIABLES ---
String inputString = "";         // A String to hold incoming data
boolean stringComplete = false;  // Whether the string is complete
unsigned long pumpStopTime = 0;  // Time in millis when the pump should stop

void setup() {
  // Initialize serial communication:
  Serial.begin(SERIAL_BAUD_RATE);
  inputString.reserve(200); // Reserve memory for the input string

  // Initialize the relay pin as an output:
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  // Ensure the pump is OFF by default (Relays can be active HIGH or LOW, adjust if needed)
  digitalWrite(PUMP_RELAY_PIN, LOW); 

  Serial.println("FlowFli Pump Controller Initialized.");
}

void loop() {
  // Check for incoming serial data
  if (stringComplete) {
    handleCommand(inputString);
    inputString = "";
    stringComplete = false;
  }

  // Check if the pump needs to be turned off
  if (pumpStopTime > 0 && millis() >= pumpStopTime) {
    stopPump();
  }
}

/*
  SerialEvent occurs whenever a new data comes in the hardware serial RX. This
  routine is run between each time loop() runs, so using software serial or
  delaying events will interfere with this routine.
*/
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    inputString += inChar;
    // if the incoming character is a newline, set a flag so the main loop can
    // do something about it:
    if (inChar == '\n') {
      stringComplete = true;
    }
  }
}

void handleCommand(String command) {
  command.trim(); // Remove whitespace
  Serial.print("Received command: ");
  Serial.println(command);

  // Check for the ACTIVATE command
  if (command.startsWith("ACTIVATE,")) {
    // Extract the duration
    String durationStr = command.substring(command.indexOf(',') + 1);
    int durationSeconds = durationStr.toInt();

    if (durationSeconds > 0) {
      startPump(durationSeconds);
    } else {
      Serial.println("Error: Invalid duration.");
    }
  } else {
    Serial.println("Error: Unknown command.");
  }
}

void startPump(int durationSeconds) {
  // Calculate when to stop the pump
  pumpStopTime = millis() + (durationSeconds * 1000L); 
  
  digitalWrite(PUMP_RELAY_PIN, HIGH); // Turn the pump ON
  
  Serial.print("Pump activated for ");
  Serial.print(durationSeconds);
  Serial.println(" seconds.");
}

void stopPump() {
  digitalWrite(PUMP_RELAY_PIN, LOW); // Turn the pump OFF
  pumpStopTime = 0; // Reset the stop time
  Serial.println("Pump has been deactivated.");
}
