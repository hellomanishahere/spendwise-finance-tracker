import React, { useState } from "react";

function ExpenseForm() {
  const [amount, setAmount] = useState("");

  return (
    <div>
      <h2>Add Expense</h2>
      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </div>
  );
}

export default ExpenseForm;