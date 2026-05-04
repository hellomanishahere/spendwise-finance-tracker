import { useState, useEffect } from "react";
import ExpenseForm from "./components/ExpenseForm";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); 
  const [editingExpense, setEditingExpense] = useState(null); 

  // GROUPS STATE (ADDED)
  const [groups, setGroups] = useState(["Trip", "Roommates"]);
  const [selectedGroup, setSelectedGroup] = useState("Trip");

  // this'll load from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(stored);
    setIsLoaded(true); 
  }, []);

  // saving ONLY after loading is done
  useEffect(() => {
    if (isLoaded) {
      console.log("SAVING:", expenses);
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses, isLoaded]);

  // group function
  const addGroup = (groupName) => {
    if (!groupName) return;
    if (!groups.includes(groupName)) {
      setGroups((prev) => [...prev, groupName]);
    }
  };

  const addExpense = (expense) => {
    console.log("NEW EXPENSE:", expense);

    // attach group
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
      prev.map((exp) => (exp.id === updated.id ? updated : exp))
    );
    setEditingExpense(null);
  };

  // SPLITWISE logic
  const calculateBalances = () => {
    const balances = {};

    expenses.forEach((exp) => {
      if (!exp.paidBy) return;

      if (!balances[exp.paidBy]) {
        balances[exp.paidBy] = 0;
      }

      balances[exp.paidBy] += exp.amount;
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const people = Object.keys(balances);

    if (people.length === 0) return {};

    const splitAmount = total / people.length;

    people.forEach((person) => {
      balances[person] = balances[person] - splitAmount;
    });

    return balances;
  };

  // settle up logic
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
    <div>
      <h1>SpendWise</h1>

      {/*  group SELECTOR */}
      <h2>Select Group</h2>
      <select
        value={selectedGroup}
        onChange={(e) => setSelectedGroup(e.target.value)}
      >
        {groups.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      {/* group INPUT */}
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

      <ExpenseForm
        onAddExpense={addExpense}
        editingExpense={editingExpense}
        updateExpense={updateExpense}
      />

      <h2>All Expenses</h2>
      <ul>
        {expenses
          .filter((e) => e.group === selectedGroup) // FILTER BY GROUP
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

      <h2>Settle Up Transactions</h2>

      <ul>
        {getSettlements().map((s, index) => (
          <li key={index}>
            {s.from} pays {s.to} ₹{s.amount.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;