import React from 'react';

interface Log {
    timestamp: string;
    level: string;
    message: string;
    data?: any;
}

interface LogViewProps {
    logs: Log[];
}

const LogView: React.FC<LogViewProps> = ({ logs }) => {
    return (
        <div style={{
            marginTop: '20px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            padding: '10px',
            height: '300px',
            overflowY: 'scroll',
            backgroundColor: '#fdfdfd',
            fontFamily: 'monospace',
            fontSize: '12px'
        }}>
            <h3>System Logs</h3>
            <div>
                {logs.slice(0).reverse().map((log, index) => (
                    <div key={index} style={{ borderBottom: '1px solid #eee', padding: '4px 0', color: log.level === 'error' ? 'red' : (log.level === 'warn' ? 'orange' : 'black') }}>
                        <strong>{new Date(log.timestamp).toLocaleTimeString()}</strong> [{log.level.toUpperCase()}]: {log.message}
                        {log.data && <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(log.data, null, 2)}</pre>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LogView;
