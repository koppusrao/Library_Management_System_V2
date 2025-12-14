import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Reports.css";

// Format protobuf timestamp
function formatTimestamp(ts) {
  if (!ts || !ts.seconds) return "";
  return new Date(ts.seconds * 1000).toLocaleString();
}

// Format google.type.Date
function formatProtoDate(d) {
  if (!d || !d.year) return "";
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

function MemberBorrowReport() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [loans, setLoans] = useState([]);

  // Load members for dropdown (ascending by name)
  useEffect(() => {
    axios
      .get("http://localhost:3001/members")
      .then((res) => {
        const sorted = [...(res.data || [])].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setMembers(sorted);
      })
      .catch((err) => console.error("Error loading members:", err));
  }, []);

  const fetchReport = () => {
    if (!selectedMember) return;

    axios
      .get("http://localhost:3001/loans")
      .then((res) => {
        const allLoans = Array.isArray(res.data) ? res.data : [];

        const filtered = allLoans.filter(
          (l) => Number(l.member_id) === Number(selectedMember)
        );

        // Keep existing sort by Loan ID (ascending)
        filtered.sort((a, b) => Number(a.id) - Number(b.id));

        setLoans(filtered);
      })
      .catch((err) => console.error("Error fetching loans:", err));
  };

  return (
    <div className="report-container">
      <div className="report-title">Member Book Borrow Report</div>

      <div className="report-filters">
        <label>Select Member:</label>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          <option value="">-- Select Member --</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.email})
            </option>
          ))}
        </select>

        <button onClick={fetchReport} disabled={!selectedMember}>
          View Report
        </button>
      </div>

      {loans.length === 0 ? (
        <div className="report-empty">
          No borrowed books for selected member.
        </div>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Book Title</th>
              <th>Borrowed At</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>{loan.book_title}</td>
                <td>{formatTimestamp(loan.borrowed_at)}</td>
                <td>{formatProtoDate(loan.due_date)}</td>
                <td>{loan.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MemberBorrowReport;