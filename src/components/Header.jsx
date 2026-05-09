import React from 'react';

function Header({ darkMode, setDarkMode, groups, selectedGroup, setSelectedGroup, addGroup }) {
  const handleNewGroup = (e) => {
    if (e.key === 'Enter') {
      addGroup(e.target.value);
      e.target.value = '';
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>SpendWise</h1>

      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{ marginBottom: '20px', padding: '8px 12px', cursor: 'pointer' }}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <h2>Select Group</h2>
      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        style={{ marginRight: '10px' }}
      >
        {groups.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="New group name"
        onKeyDown={handleNewGroup}
      />
    </div>
  );
}

export default Header;
