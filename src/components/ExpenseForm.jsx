import React, { useState, useEffect } from "react";

function ExpenseForm({ onAddExpense, editingExpense, updateExpense }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [paidBy, setPaidBy] = useState(""); 

  // fill form when editing
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount);
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setNote(editingExpense.note);
      setPaidBy(editingExpense.paidBy);
    }
  }, [editingExpense]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || !category || !date) {
      alert("Please fill all required fields");
      return;
    }

    const expense = {
      id: editingExpense ? editingExpense.id : Date.now(),
      amount: Number(amount),
      category,
      date,
      note,
      paidBy, 
    };

    if (editingExpense) {
      updateExpense(expense);
    } else {
      onAddExpense(expense);
    }

    // clear form
    setAmount("");
    setCategory("");
    setDate("");
    setNote("");
    setPaidBy(""); 
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Select Category</option>
        <option value="Food">Food</option>
        <option value="Travel">Travel</option>
        <option value="Shopping">Shopping</option>
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        type="text"
        placeholder="Description"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <input
        type="text"
        placeholder="Paid by (name)"
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
      />

      <button type="submit">
        {editingExpense ? "Update Expense" : "Add Expense"}
      </button>
    </form>
  );
}

export default ExpenseForm;