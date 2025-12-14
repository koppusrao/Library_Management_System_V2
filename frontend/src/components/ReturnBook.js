import React, { useEffect, useState } from "react";
import axios from "axios";

function ReturnBook() {
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]); // filtered borrowed & not returned
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedLoan, setSelectedLoan] = useState("");
  const [message, setMessage] = useState("");

  // ---------------- Load members ----------------
  useEffect(() => {
    axios
      .get("http://localhost:3001/members")
      .then((res) => setMembers(res.data || []))
      .catch((err) => console.log("Members Load Error:", err));
  }, []);

  // ---------------- Load borrowed (not returned) loans ----------------
  useEffect(() => {
    if (!selectedMember) {
      setLoans([]);
      setSelectedLoan("");
      setMessage("");
      return;
    }

    axios
      .get(`http://localhost:3001/loans?member_id=${selectedMember}&status=borrowed`)
      .then((res) => {
        const allLoans = res.data || [];

        // STRICT FILTER: borrowed AND not returned
        const filtered = allLoans.filter(
          (l) => l.status === "borrowed" && !l.returned_at
        );

        setLoans(filtered);
        setSelectedLoan("");
        setMessage("");
      })
      .catch((err) => console.log("Loans Load Error:", err));
  }, [selectedMember]);

  // ---------------- Return book ----------------
  const returnBook = () => {
    if (!selectedLoan) return;

    axios
      .post("http://localhost:3001/return", {
        loan_id: Number(selectedLoan),
      })
      .then(() => {
        setMessage("Book returned successfully.");

        // Refresh loan list after return
        axios
          .get(`http://localhost:3001/loans?member_id=${selectedMember}&status=borrowed`)
          .then((res) => {
            const refreshed = (res.data || []).filter(
              (l) => l.status === "borrowed" && !l.returned_at
            );
            setLoans(refreshed);
            setSelectedLoan("");
          });
      })
      .catch((err) => {
        console.log("Return Error:", err);
        alert("Return failed.");
      });
  };

  return (
    <div style={{ maxWidth: "420px", margin: "20px auto", fontFamily: "Arial" }}>
      <h2>Return Book</h2>

      {/* Member dropdown */}
      <label>Member:</label>
      <select
        value={selectedMember}
        onChange={(e) => setSelectedMember(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
      >
        <option value="">Select Member</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.email})
          </option>
        ))}
      </select>

      {/* Book dropdown */}
      <label>Book:</label>
      <select
        value={selectedLoan}
        onChange={(e) => setSelectedLoan(e.target.value)}
        disabled={!selectedMember || loans.length === 0}
        style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
      >
        <option value="">Select Book</option>
        {loans.map((loan) => (
          <option key={loan.id} value={loan.id}>
            {loan.book_title} (Loan ID: {loan.id})
          </option>
        ))}
      </select>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <button
        onClick={returnBook}
        disabled={!selectedLoan}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: selectedLoan ? "#2196F3" : "#aaa",
          color: "white",
          border: "none",
          fontSize: "16px",
          cursor: selectedLoan ? "pointer" : "not-allowed",
        }}
      >
        Return
      </button>
    </div>
  );
}

export default ReturnBook;