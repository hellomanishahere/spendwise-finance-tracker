import React from 'react';

function ExpenseList({ expenses, selectedGroup, darkMode, onDelete, onEdit }) {
  const cardStyle = {
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: darkMode ? '#2a2a2a' : '#fff',
    marginBottom: '20px',
  };

  const buttonStyle = {
    padding: '5px 10px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  };

  const filtered = expenses.filter((e) => e.group === selectedGroup);

  return (
    <div style={cardStyle}>
      <h2>All Expenses</h2>
      <ul>
        {filtered.map((e) => (
          <li key={e.id} style={{ marginBottom: '8px' }}>
            ₹{e.amount} - {e.category} - {e.date} ({e.group})
            <button
              onClick={() => onDelete(e.id)}
              style={{ ...buttonStyle, marginLeft: '10px', background: '#ff4d4d', color: '#fff' }}
            >
              Delete
            </button>
            <button
              onClick={() => onEdit(e)}
              style={{ ...buttonStyle, marginLeft: '10px', background: '#4da6ff', color: '#fff' }}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExpenseList;
