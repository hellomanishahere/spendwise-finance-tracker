import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';

function BalanceChart({ balances, darkMode }) {
  const cardStyle = {
    flex: 1,
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: darkMode ? '#2a2a2a' : '#fff',
    color: darkMode ? '#fff' : '#000',
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Balances</h3>

      {!balances || balances.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.6 }}>
          No balances yet. Add a split expense to see results.
        </div>
      ) : (
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={balances} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#555' : '#ccc'} />
              <XAxis dataKey="name" stroke={darkMode ? '#fff' : '#000'} />
              <YAxis stroke={darkMode ? '#fff' : '#000'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#333' : '#fff',
                  color: darkMode ? '#fff' : '#000',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                }}
                cursor={{ fill: darkMode ? '#444' : '#f5f5f5' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {balances.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#4caf50' : '#f44336'} />
                ))}
                <LabelList dataKey="value" position="top" fill={darkMode ? '#fff' : '#000'} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default BalanceChart;
