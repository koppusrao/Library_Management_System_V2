import React, { useEffect, useState } from "react";
import axios from "axios";

function BorrowBook() {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [computedDueDate, setComputedDueDate] = useState("");

  // Load members and available books
  const loadData = () => {
    axios
      .get("http://localhost:3001/members")
      .then((res) => setMembers(res.data))
      .catch((err) => console.log("Members Load Error:", err));

    axios
      .get("http://localhost:3001/available-books")
      .then((res) => setBooks(res.data))
      .catch((err) => console.log("Available Books Load Error:", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Recalculate due date whenever a book is selected
  useEffect(() => {
    if (selectedBook) {
      const today = new Date();
      const due = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
      const formatted = due.toISOString().split("T")[0]; // YYYY-MM-DD
      setComputedDueDate(formatted);
    } else {
      setComputedDueDate("");
    }
  }, [selectedBook]);

  // Borrow Book logic
  const borrow = () => {
    const selectedBookObj = books.find((b) => b.id === Number(selectedBook));

    if (!selectedBookObj) {
      alert("Selected book is no longer available!");
      loadData();
      return;
    }

    if (selectedBookObj.copies_available <= 0) {
      alert("Selected book is not available.");
      loadData();
      return;
    }

    if (!computedDueDate) {
      alert("Due date is not set. Please select a book.");
      return;
    }

    // Borrow API call with due_date included
    axios
      .post("http://localhost:3001/borrow", {
        member_id: Number(selectedMember),
        book_id: Number(selectedBook),
        due_date: computedDueDate,
      })
      .then(() => {
        alert("Book borrowed successfully!");
        loadData(); // refresh books and members
        setSelectedBook("");
        setComputedDueDate("");
      })
      .catch((err) => {
        console.log("Borrow Error:", err);
        alert("Borrow failed.");
      });
  };

  return (
    <div style={{ maxWidth: "450px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>Borrow Book</h2>

      {/* Member Dropdown */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Member:</label>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          style={{ width: "100%", padding: "8px", fontSize: "14px" }}
        >
          <option value="">Select Member</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.email})
            </option>
          ))}
        </select>
      </div>

      {/* Book Dropdown */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Book:</label>
        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          style={{ width: "100%", padding: "8px", fontSize: "14px" }}
        >
          <option value="">Select Book</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title} — Available: {b.copies_available}
            </option>
          ))}
        </select>
      </div>

      {/* Auto-calculated Due Date (display only) */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Due Date (Auto-Calculated):</label>
        <input
          type="date"
          value={computedDueDate}
          disabled
          style={{ width: "100%", padding: "8px", fontSize: "14px" }}
        />
      </div>

      <button
        onClick={borrow}
        disabled={!selectedMember || !selectedBook}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#4CAF50",
          color: "white",
          fontSize: "16px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Borrow
      </button>
    </div>
  );
}

export default BorrowBook;