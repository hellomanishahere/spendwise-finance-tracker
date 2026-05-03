import { useState, useEffect } from "react";
import ExpenseForm from "./components/ExpenseForm";

function App() {
  const [expenses, setExpenses] = useState([]);

  // this'll load from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(stored);
  }, []);

  //this is saving to localStorage
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense) => {
    setExpenses([...expenses, expense]);
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
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
