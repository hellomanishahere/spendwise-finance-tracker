import { useState, useEffect } from "react";
import ExpenseForm from "./components/ExpenseForm";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import "./App.css";
function App() {
  const [expenses, setExpenses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); 
  const [editingExpense, setEditingExpense] = useState(null); 

  const [groups, setGroups] = useState(["Trip", "Roommates"]);
  const [selectedGroup, setSelectedGroup] = useState("Trip");

  /* DARK MODE STATE */
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) || false
  );

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(stored);
    setIsLoaded(true); 
  }, []);

  useEffect(() => {
    if (isLoaded) {
      console.log("SAVING:", expenses);
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses, isLoaded]);

  /* SAVE DARK MODE */
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  const addGroup = (groupName) => {
    if (!groupName) return;
    if (!groups.includes(groupName)) {
      setGroups((prev) => [...prev, groupName]);
    }
  };

  const addExpense = (expense) => {
    const expenseWithGroup = {
      ...expense,
      group: selectedGroup,
    };
    setExpenses((prev) => [...prev, expenseWithGroup]);
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  const editExpense = (expense) => {
    setEditingExpense(expense);
  };

  const updateExpense = (updated) => {
    setExpenses((prev) =>
      prev.map((exp) =>
        exp.id === updated.id ? { ...updated, group: exp.group } : exp
      )
    );
    setEditingExpense(null);
  };

  // AUTO GROUP MEMBERS 
  const getGroupMembers = () => {
    const members = new Set();

    expenses
      .filter((e) => e.group === selectedGroup)
      .forEach((e) => {
        if (e.paidBy) members.add(e.paidBy);
        if (e.splitWith) {
          e.splitWith.forEach((p) => members.add(p));
        }
      });

    return Array.from(members);
  };

  // SPLIT LOGIC
  const calculateBalances = () => {
    const balances = {};

    const filteredExpenses = expenses.filter(
      (e) => e.group === selectedGroup
    );

    filteredExpenses.forEach((exp) => {
      const { paidBy, amount, splitWith, splitAmounts } = exp;

      if (!paidBy || !splitWith || splitWith.length === 0) return;

      // UNEQUAL SPLIT SUPPORT
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

      // payer gets full amount
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
      if (amount > 0) {
        creditors.push({ person, amount });
      } else if (amount < 0) {
        debtors.push({ person, amount: Math.abs(amount) });
      }
    });

    const settlements = [];

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const min = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: min,
      });

      debtor.amount -= min;
      creditor.amount -= min;

      if (debtor.amount === 0) i++;
      if (creditor.amount === 0) j++;
    }

    return settlements;
  };

  /* CATEGORY DATA FOR PIE CHART */
  const getCategoryData = () => {
    const data = {};
    expenses
      .filter((e) => e.group === selectedGroup)
      .forEach((e) => {
        data[e.category] = (data[e.category] || 0) + e.amount;
      });

    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  /* BALANCE DATA FOR BAR CHART */
  const getBalanceData = () => {
    const balances = calculateBalances();
    return Object.entries(balances).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="dashboard-container">
      
      <header className="header">
        <h1 className="title">SpendWise</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="btn btn-icon"
          title="Toggle Dark Mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </header>

      {/* GROUP SELECT */}
      <div className="controls-bar">
        <div className="group-selector">
          <label className="form-label" style={{ marginBottom: 0 }}>Select Group:</label>
          <select
            className="form-control"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            style={{ width: "auto" }}
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="group-selector">
          <input
            type="text"
            className="form-control"
            placeholder="New group name"
            style={{ width: "auto" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addGroup(e.target.value);
                e.target.value = "";
              }
            }}
          />
        </div>
      </div>

      {/* LAYOUT */}
      <div className="layout-grid">
        
        {/* FORM */}
        <aside className="card">
          <ExpenseForm
            onAddExpense={addExpense}
            editingExpense={editingExpense}
            updateExpense={updateExpense}
            groupMembers={getGroupMembers()} 
          />
        </aside>

        {/* RIGHT SIDE */}
        <main>

          {/* EXPENSES */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <h2 className="card-title">All Expenses</h2>
            <ul className="expense-list">
              {expenses
                .filter((e) => e.group === selectedGroup)
                .map((e) => (
                  <li key={e.id} className="expense-item">
                    <div className="expense-info">
                      <span className="expense-category">{e.category}</span>
                      <div className="expense-amount-date">
                        <span className="expense-amount">₹{e.amount}</span>
                        <span className="expense-date">{e.date}</span>
                      </div>
                      {e.note && <span className="expense-date" style={{ fontSize: '0.75rem' }}>{e.note}</span>}
                    </div>

                    <div className="expense-actions">
                      <button
                        onClick={() => editExpense(e)}
                        className="btn btn-sm btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteExpense(e.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>

          {/* CHARTS */}
          <div className="charts-grid">
            
            <div className="card chart-container" style={{ flexDirection: "column" }}>
              <h3 className="card-title" style={{ alignSelf: "flex-start" }}>Category Split</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={getCategoryData()} dataKey="value" nameKey="name" outerRadius={80}>
                    {getCategoryData().map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--shadow-md)", backgroundColor: "var(--bg-card)", color: "var(--text-main)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card chart-container" style={{ flexDirection: "column" }}>
              <h3 className="card-title" style={{ alignSelf: "flex-start" }}>Balances</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getBalanceData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "var(--input-bg)" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--shadow-md)", backgroundColor: "var(--bg-card)", color: "var(--text-main)" }} />
                  <Bar dataKey="value" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* SUMMARY */}
          <div className="summary-grid">
            
            <div className="card">
              <h2 className="card-title">Splitwise Summary</h2>
              <ul className="summary-list">
                {Object.entries(calculateBalances()).map(([person, amount]) => (
                  <li key={person} className="summary-item">
                    <span>{person}</span>
                    {amount > 0
                      ? <span className="amount-positive">gets ₹{amount.toFixed(2)}</span>
                      : amount < 0 ? <span className="amount-negative">owes ₹{Math.abs(amount).toFixed(2)}</span>
                      : <span style={{ color: "var(--text-muted)" }}>settled</span>
                    }
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2 className="card-title">Settle Up Transactions</h2>
              <ul className="summary-list">
                {getSettlements().length === 0 && (
                  <li className="summary-item" style={{ justifyContent: "center", color: "var(--text-muted)" }}>
                    All settled up!
                  </li>
                )}
                {getSettlements().map((s, index) => (
                  <li key={index} className="summary-item settlement-item">
                    <span style={{ flex: 1 }}>{s.from} pays {s.to}</span>
                    <span className="settlement-amount">₹{s.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default App;