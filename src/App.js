import { useState } from "react";
import ExpenseForm from "./components/ExpenseForm";

function App() {
  const [expenses, setExpenses] = useState([]);

  const addExpense = (expense) => {
    setExpenses([...expenses, expense]);
    console.log(expense);
  };

  return (
    <div>
      <h1>SpendWise</h1>
      <ExpenseForm onAddExpense={addExpense} />
    </div>
  );
}

export default App;
