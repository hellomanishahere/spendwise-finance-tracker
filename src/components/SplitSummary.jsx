import React from 'react';

function SplitSummary({ balances, settlements, darkMode }) {
  const cardStyle = {
    flex: 1,
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: darkMode ? '#2a2a2a' : '#fff',
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={cardStyle}>
        <h2>Splitwise Summary</h2>
        <ul>
          {Object.entries(balances).map(([person, amount]) => (
            <li key={person}>
              {person}:{' '}
              {amount > 0
                ? `gets ₹${amount.toFixed(2)}`
                : `owes ₹${Math.abs(amount).toFixed(2)}`}
            </li>
          ))}
        </ul>
      </div>

      <div style={cardStyle}>
        <h2>Settle Up Transactions</h2>
        <ul>
          {settlements.map((s, index) => (
            <li key={index}>
              {s.from} pays {s.to} ₹{s.amount.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SplitSummary;
