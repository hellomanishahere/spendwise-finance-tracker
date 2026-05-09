import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './CategorySplit.css';

const CATEGORY_COLORS = {
  Food:          '#FF6B6B',
  Travel:        '#4ECDC4',
  Shopping:      '#A78BFA',
  Entertainment: '#FFA500',
  Bills:         '#3B82F6',
  Others:        '#9CA3AF',
};

const CATEGORY_EMOJIS = {
  Food:          '🍔',
  Travel:        '✈️',
  Shopping:      '🛍️',
  Entertainment: '🎬',
  Bills:         '🧾',
  Others:        '📦',
};

function CategorySplit({ expenses, selectedGroup, darkMode }) {
  const grouped = expenses.filter(e => e.group === selectedGroup);

  const categoryTotals = grouped.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  const grandTotal = pieData.reduce((sum, d) => sum + d.value, 0);

  const personTotals = grouped.reduce((acc, e) => {
    if (e.paidBy) acc[e.paidBy] = (acc[e.paidBy] || 0) + e.amount;
    return acc;
  }, {});

  const categoryPersonMap = grouped.reduce((acc, e) => {
    if (!acc[e.category]) acc[e.category] = {};
    if (e.paidBy) acc[e.category][e.paidBy] = (acc[e.category][e.paidBy] || 0) + e.amount;
    return acc;
  }, {});

  const cardBg = darkMode ? '#2a2a2a' : '#fff';
  const cardColor = darkMode ? '#fff' : '#000';

  if (pieData.length === 0) {
    return (
      <div className="category-split-card" style={{ background: cardBg, color: cardColor }}>
        <h3>Category Split</h3>
        <div className="empty-state">No category data available</div>
      </div>
    );
  }

  return (
    <div className="category-split-card" style={{ background: cardBg, color: cardColor }}>
      <h3>Category Split</h3>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={85} innerRadius={40}>
            {pieData.map((entry, i) => (
              <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#9CA3AF'} />
            ))}
          </Pie>
          <Tooltip formatter={(val) => `₹${val.toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>

      <ul className="category-list">
        {pieData.map((cat) => {
          const color = CATEGORY_COLORS[cat.name] || '#9CA3AF';
          const emoji = CATEGORY_EMOJIS[cat.name] || '📦';
          const pct = ((cat.value / grandTotal) * 100).toFixed(1);
          return (
            <li key={cat.name} className="category-row">
              <span className="category-dot" style={{ background: color }} />
              <span className="category-name">{emoji} {cat.name}</span>
              <span className="category-amount">₹{cat.value.toFixed(2)}</span>
              <span className="category-pct">{pct}%</span>
            </li>
          );
        })}
      </ul>

      <h4>Contribution by Person</h4>
      {Object.entries(personTotals).map(([person, amt]) => {
        const pct = ((amt / grandTotal) * 100).toFixed(1);
        return (
          <div key={person} className="person-row">
            <span>{person}</span>
            <span>
              <span className="person-amount">₹{amt.toFixed(2)}</span>
              <span className="person-pct">({pct}%)</span>
            </span>
          </div>
        );
      })}

      <h4>Category Breakdown</h4>
      {Object.entries(categoryPersonMap).map(([cat, people]) => {
        const color = CATEGORY_COLORS[cat] || '#9CA3AF';
        const emoji = CATEGORY_EMOJIS[cat] || '📦';
        return (
          <div key={cat} className="breakdown-group">
            <div className="breakdown-title">
              <span className="category-dot" style={{ background: color }} />
              {emoji} {cat}
            </div>
            {Object.entries(people).map(([person, amt]) => (
              <div key={person} className="breakdown-person-row">
                <span>{person}</span>
                <span>₹{amt.toFixed(2)}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default CategorySplit;
