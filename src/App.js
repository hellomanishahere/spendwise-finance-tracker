import { useState, useEffect } from 'react';
import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import CategorySplit from './components/CategorySplit/CategorySplit';
import BalanceChart from './components/BalanceChart';
import SplitSummary from './components/SplitSummary';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [groups, setGroups] = useState(['Trip', 'Roommates']);
  const [selectedGroup, setSelectedGroup] = useState('Trip');
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem('darkMode')) || false
  );

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('expenses')) || [];
    setExpenses(stored);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses, isLoaded]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const addGroup = (groupName) => {
    if (!groupName) return;
    if (!groups.includes(groupName)) {
      setGroups((prev) => [...prev, groupName]);
    }
  };

  const addExpense = (expense) => {
    setExpenses((prev) => [...prev, { ...expense, group: selectedGroup }]);
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const editExpense = (expense) => {
    setEditingExpense(expense);
  };

  const updateExpense = (updated) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === updated.id ? { ...updated, group: exp.group } : exp))
    );
    setEditingExpense(null);
  };

  const getGroupMembers = () => {
    const members = new Set();
    expenses
      .filter((e) => e.group === selectedGroup)
      .forEach((e) => {
        if (e.paidBy) members.add(e.paidBy);
        if (e.splitWith) e.splitWith.forEach((p) => members.add(p));
      });
    return Array.from(members);
  };

  const calculateBalances = () => {
    const balances = {};
    expenses
      .filter((e) => e.group === selectedGroup)
      .forEach((exp) => {
        const { paidBy, amount, splitWith, splitAmounts } = exp;
        if (!paidBy || !splitWith || splitWith.length === 0) return;

        if (splitAmounts && Object.keys(splitAmounts).length > 0) {
          Object.entries(splitAmounts).forEach(([person, val]) => {
            if (!balances[person]) balances[person] = 0;
            balances[person] -= Number(val);
          });
        } else {
          const share = amount / splitWith.length;
          splitWith.forEach((person) => {
            if (!balances[person]) balances[person] = 0;
            balances[person] -= share;
          });
        }

        if (!balances[paidBy]) balances[paidBy] = 0;
        balances[paidBy] += amount;
      });
    return balances;
  };

  const getSettlements = () => {
    const balances = calculateBalances();
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([person, amount]) => {
      if (amount > 0) creditors.push({ person, amount });
      else if (amount < 0) debtors.push({ person, amount: Math.abs(amount) });
    });

    const settlements = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const min = Math.min(debtor.amount, creditor.amount);
      settlements.push({ from: debtor.person, to: creditor.person, amount: min });
      debtor.amount -= min;
      creditor.amount -= min;
      if (debtor.amount === 0) i++;
      if (creditor.amount === 0) j++;
    }

    return settlements;
  };

  const getBalanceData = () => {
    const balances = calculateBalances();
    return Object.entries(balances).map(([name, value]) => ({ name, value }));
  };

  const cardStyle = {
    border: '1px solid #ddd',
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: darkMode ? '#2a2a2a' : '#fff',
  };

  const themeStyles = {
    backgroundColor: darkMode ? '#121212' : '#ffffff',
    color: darkMode ? '#ffffff' : '#000000',
    minHeight: '100vh',
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', ...themeStyles }}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        groups={groups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        addGroup={addGroup}
      />

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1, ...cardStyle }}>
          <ExpenseForm
            onAddExpense={addExpense}
            editingExpense={editingExpense}
            updateExpense={updateExpense}
            groupMembers={getGroupMembers()}
          />
        </div>

        <div style={{ flex: 2 }}>
          <ExpenseList
            expenses={expenses}
            selectedGroup={selectedGroup}
            darkMode={darkMode}
            onDelete={deleteExpense}
            onEdit={editExpense}
          />

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <CategorySplit
              expenses={expenses}
              selectedGroup={selectedGroup}
              darkMode={darkMode}
            />
            <BalanceChart balances={getBalanceData()} darkMode={darkMode} />
          </div>

          <SplitSummary
            balances={calculateBalances()}
            settlements={getSettlements()}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  );
}

export default App;