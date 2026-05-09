import React, { useState, useEffect } from "react";

function ExpenseForm({ onAddExpense, editingExpense, updateExpense, groupMembers }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [splitAmounts, setSplitAmounts] = useState({}); // unequal split

  // while editing fill form logic
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
    <form onSubmit={handleSubmit}>
      <h2 className="card-title">{editingExpense ? "Edit Expense" : "Add Expense"}</h2>

      <div className="form-group">
        <label className="form-label">Amount</label>
        <input
          type="number"
          className="form-control"
          placeholder="₹ Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <select 
          className="form-control"
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Date</label>
        <input 
          type="date" 
          className="form-control"
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <input
          type="text"
          className="form-control"
          placeholder="What was this for?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Paid by</label>
        <input
          type="text"
          className="form-control"
          placeholder="Name of payer"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        />
      </div>

      {/* checkbox ui */}
      <div className="split-section">
        <label className="form-label" style={{ marginBottom: "12px" }}>Split Between</label>
        {groupMembers.map((person) => (
          <div key={person} className="split-person">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedPeople.includes(person)}
                onChange={() => togglePerson(person)}
              />
              {person}
            </label>

            {/* unequal input */}
            {selectedPeople.includes(person) && (
              <input
                type="number"
                className="form-control split-amount-input"
                placeholder="₹"
                value={splitAmounts[person] || ""}
                onChange={(e) =>
                  handleAmountChange(person, e.target.value)
                }
              />
            )}
          </div>
        ))}
      </div>

      <button type="submit" className="btn btn-primary">
        {editingExpense ? "Update Expense" : "Add Expense"}
      </button>
    </form>
  );
}

export default ExpenseForm;
