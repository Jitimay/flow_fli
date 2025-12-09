import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

interface SensorData {
    waterLevel: number;
    flowRate: number;
    vibration: number;
    timestamp: string;
}

const Dashboard: React.FC = () => {
    const [sensorData, setSensorData] = useState<SensorData | null>(null);
    const [pumpStatus, setPumpStatus] = useState<string>('OFF');
    const [purchaseAmount, setPurchaseAmount] = useState<number>(1.00);
    const [message, setMessage] = useState<string>('');

    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_URL}/sensor/read`);
            setSensorData(response.data);
            setPumpStatus(response.data.flowRate > 0 ? 'ON' : 'OFF');
        } catch (err) {
            console.error('Failed to fetch sensor data', err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const handlePurchase = async () => {
        try {
            setMessage('Processing payment...');
            const response = await axios.post(`${API_URL}/payment/process`, {
                amount: purchaseAmount,
                source: `dashboard-user-${Date.now()}`
            });
            setMessage(`✅ Payment successful! Transaction: ${response.data.transactionId}`);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Payment failed';
            setMessage(`❌ ${errorMessage}`);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>FlowFli Water Management Dashboard</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>Water Level</h3>
                    <div style={{ fontSize: '2em', color: '#007bff' }}>
                        {sensorData ? `${(sensorData.waterLevel * 100).toFixed(1)}%` : 'Loading...'}
                    </div>
                </div>
                
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>Pump Status</h3>
                    <div style={{ fontSize: '2em', color: pumpStatus === 'ON' ? 'green' : 'red' }}>
                        {pumpStatus}
                    </div>
                </div>
                
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>Flow Rate</h3>
                    <div style={{ fontSize: '2em' }}>
                        {sensorData ? `${sensorData.flowRate.toFixed(2)} L/min` : 'Loading...'}
                    </div>
                </div>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Purchase Water</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                        type="number" 
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(parseFloat(e.target.value))}
                        min="0.50"
                        step="0.25"
                        style={{ padding: '8px', fontSize: '16px' }}
                    />
                    <button 
                        onClick={handlePurchase}
                        style={{ 
                            padding: '8px 15px', 
                            fontSize: '16px', 
                            backgroundColor: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Purchase ${purchaseAmount.toFixed(2)}
                    </button>
                </div>
                {message && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                        {message}
                    </div>
                )}
            </div>

            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                <h3>Sensor Data</h3>
                {sensorData ? (
                    <div>
                        <p><strong>Vibration:</strong> {sensorData.vibration.toFixed(2)} Hz</p>
                        <p><strong>Last Update:</strong> {new Date(sensorData.timestamp).toLocaleString()}</p>
                    </div>
                ) : (
                    <p>Loading sensor data...</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
