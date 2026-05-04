import { useState, useEffect } from "react";
import ExpenseForm from "./components/ExpenseForm";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); 
  const [editingExpense, setEditingExpense] = useState(null); 

  const [groups, setGroups] = useState(["Trip", "Roommates"]);
  const [selectedGroup, setSelectedGroup] = useState("Trip");

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

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>SpendWise</h1>

      {/* GROUP SELECT */}
      <h2>Select Group</h2>
      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
        style={{ marginRight: "10px" }}
      >
        {groups.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="New group name"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addGroup(e.target.value);
            e.target.value = "";
          }
        }}
      />

      {/* LAYOUT */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        
        {/* FORM */}
        <div style={{ flex: 1, border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
          <ExpenseForm
            onAddExpense={addExpense}
            editingExpense={editingExpense}
            updateExpense={updateExpense}
            groupMembers={getGroupMembers()} 
          />
        </div>

        {/* RIGHT SIDE */}
        <div style={{ flex: 2 }}>

          {/* EXPENSES */}
          <div style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
            <h2>All Expenses</h2>
            <ul>
              {expenses
                .filter((e) => e.group === selectedGroup)
                .map((e) => (
                  <li key={e.id}>
                    ₹{e.amount} - {e.category} - {e.date} ({e.group})

                    <button
                      onClick={() => deleteExpense(e.id)}
                      style={{ marginLeft: "10px", color: "red" }}
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => editExpense(e)}
                      style={{ marginLeft: "10px", color: "blue" }}
                    >
                      Edit
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* SUMMARY */}
          <div style={{ display: "flex", gap: "20px" }}>
            
            <div style={{ flex: 1, border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
              <h2>Splitwise Summary</h2>
              <ul>
                {Object.entries(calculateBalances()).map(([person, amount]) => (
                  <li key={person}>
                    {person} :{" "}
                    {amount > 0
                      ? `gets ₹${amount.toFixed(2)}`
                      : `owes ₹${Math.abs(amount).toFixed(2)}`}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ flex: 1, border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
              <h2>Settle Up Transactions</h2>
              <ul>
                {getSettlements().map((s, index) => (
                  <li key={index}>
                    {s.from} pays {s.to} ₹{s.amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default App;