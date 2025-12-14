import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Reports.css";

// Format timestamp from protobuf
function formatTimestamp(ts) {
  if (!ts || !ts.seconds) return "";
  return new Date(ts.seconds * 1000).toLocaleString();
}

// Format google.type.Date
function formatProtoDate(d) {
  if (!d || !d.year) return "";
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

function BookWiseBorrowReport() {
  const [books, setBooks] = useState([]);
  const [uniqueBooks, setUniqueBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [loans, setLoans] = useState([]);

  // Load all books into dropdown (ASCENDING ORDER)
  useEffect(() => {
    axios
      .get("http://localhost:3001/books")
      .then((res) => {
        const allBooks = res.data || [];

        // Remove duplicate titles
        const uniqueMap = new Map();
        allBooks.forEach((b) => {
          if (!uniqueMap.has(b.title)) {
            uniqueMap.set(b.title, b);
          }
        });

        // Convert to array and sort by title (ascending)
        const sortedUniqueBooks = [...uniqueMap.values()].sort((a, b) =>
          a.title.localeCompare(b.title)
        );

        setBooks(allBooks);
        setUniqueBooks(sortedUniqueBooks);
      })
      .catch((err) => console.error("Error loading books:", err));
  }, []);

  const fetchReport = () => {
    if (!selectedBook) return;

    axios
      .get("http://localhost:3001/loans")
      .then((res) => {
        const allLoans = res.data || [];

        const filtered = allLoans.filter(
          (l) => Number(l.book_id) === Number(selectedBook)
        );

        setLoans(filtered);
      })
      .catch((err) => console.error("Error fetching loans:", err));
  };

  return (
    <div className="report-container">
      <div className="report-title">Book-wise Borrowers Report</div>

      <div className="report-filters">
        <label>Select Book:</label>
        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
        >
          <option value="">-- Select Book --</option>

          {uniqueBooks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>

        <button onClick={fetchReport}>View Report</button>
      </div>

      {loans.length === 0 ? (
        <div className="report-empty">No borrowers for selected book.</div>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Borrowed At</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.member_name}</td>
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

export default BookWiseBorrowReport;