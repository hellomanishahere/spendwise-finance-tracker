import { useState, useEffect } from "react";
import ExpenseForm from "./components/ExpenseForm";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); 

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

  const addExpense = (expense) => {
    console.log("NEW EXPENSE:", expense);
    setExpenses((prev) => [...prev, expense]);
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
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

  return (
    <div>
      <h1>SpendWise</h1>
      <ExpenseForm onAddExpense={addExpense} />

      <h2>All Expenses</h2>
      <ul>
        {expenses.map((e) => (
          <li key={e.id}>
            ₹{e.amount} - {e.category} - {e.date}

            <button
              onClick={() => deleteExpense(e.id)}
              style={{ marginLeft: "10px", color: "red" }}
            >
              Delete
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
    </div>
  );
}

export default App;