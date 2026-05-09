import React, { useState, useEffect } from "react";
import "./ExpenseForm.css";

function ExpenseForm({ onAddExpense, editingExpense, updateExpense, groupMembers }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [splitAmounts, setSplitAmounts] = useState({}); // unequal split
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount);
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setNote(editingExpense.note);
      setPaidBy(editingExpense.paidBy);
      setSelectedPeople(editingExpense.splitWith || []);
      setSplitAmounts(editingExpense.splitAmounts || {});
    }
  }, [editingExpense]);

  const togglePerson = (person) => {
    setSelectedPeople((prev) =>
      prev.includes(person)
        ? prev.filter((p) => p !== person)
        : [...prev, person]
    );
  };

  const handleAmountChange = (person, value) => {
    setSplitAmounts((prev) => ({
      ...prev,
      [person]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!amount || !category || !date || !paidBy) {
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
      splitWith: selectedPeople,
      splitAmounts, 
    };

    if (editingExpense) {
      updateExpense(expense);
    } else {
      onAddExpense(expense);
    }

    setAmount("");
    setCategory("");
    setDate("");
    setNote("");
    setPaidBy("");
    setSelectedPeople([]);
    setSplitAmounts({});
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>

      <div className="form-row">
        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select category</option>
            <option value="Food">🍔 Food</option>
            <option value="Travel">✈️ Travel</option>
            <option value="Shopping">🛍️ Shopping</option>
            <option value="Entertainment">🎬 Entertainment</option>
            <option value="Bills">🧾 Bills</option>
            <option value="Others">📦 Others</option>
          </select>
        </div>
        <div className="form-group">
          <label>Paid By</label>
          <input
            type="text"
            placeholder="Name"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          />
        </div>
      </div>

      <div className="divider" />

      <div>
        <div className="split-label">Split Between</div>
        {groupMembers.length === 0 ? (
          <p className="empty-members">Add an expense first to see members here.</p>
        ) : (
          <div className="members-grid">
            {groupMembers.map((person) => (
              <div
                key={person}
                className={`member-chip ${selectedPeople.includes(person) ? "selected" : ""}`}
                onClick={() => togglePerson(person)}
              >
                {person}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPeople.length > 0 && (
        <div>
          <div className="split-label" style={{ marginBottom: "6px" }}>Custom Split Amounts</div>
          {selectedPeople.map((person) => (
            <div key={person} className="member-split-row">
              <span>{person}</span>
              <input
                type="number"
                placeholder="₹"
                value={splitAmounts[person] || ""}
                onChange={(e) => handleAmountChange(person, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="divider" />

      <div className="form-group">
        <label>Notes</label>
        <textarea
          placeholder="Optional description..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button type="submit" className="submit-btn">
        {editingExpense ? "✏️ Update Expense" : "➕ Add Expense"}
      </button>
    </form>
  );
}

export default ExpenseForm;