import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

const TestConnection: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testBackend = async () => {
    setLoading(true);
    try {
      // Test GET message
      const getResponse = await api.get<{ message: string }>('/message');
      console.log('GET Response:', getResponse.data);

      // Test POST message
      const postResponse = await api.post<{ message: string }>('/message', {
        message: 'Test from frontend',
      });
      console.log('POST Response:', postResponse.data);

      // Test submitform
      const formResponse = await api.post('/submitform', {
        amount: 1000,
        sector: 'test',
        assets: [],
        guarantors: [],
      });
      console.log('Form Response:', formResponse.data);

      setResult('✅ All connections successful! Check console for details.');
    } catch (error: unknown) {
      const err = error as AxiosError;
      console.error('Connection error:', err);
      setResult('❌ Connection failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Backend Connection Test</h2>
      <button
        onClick={testBackend}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </button>

      {result && (
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: result.includes('✅') ? '#d4edda' : '#f8d7da',
            borderRadius: '4px',
            color: result.includes('✅') ? '#155724' : '#721c24',
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
};

export default TestConnection;
