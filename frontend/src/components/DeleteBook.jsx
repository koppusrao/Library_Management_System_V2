import React, { useEffect, useState } from "react";
import { listBooks, deleteBook } from "../api/api";

const DeleteBook = () => {
  const [books, setBooks] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load books (ascending by title)
  useEffect(() => {
    const load = async () => {
      try {
        const data = await listBooks();
        const sorted = [...(data || [])].sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        setBooks(sorted);
      } catch {
        setError("Failed to load books");
      }
    };
    load();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return;

    const confirmed = window.confirm("Delete selected book?");
    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await deleteBook(Number(selectedId));

      setMessage("Book deleted successfully");
      setSelectedId("");

      const refreshed = await listBooks();
      setBooks(
        [...(refreshed || [])].sort((a, b) =>
          a.title.localeCompare(b.title)
        )
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Delete failed. Book may have active loans."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <h3>Delete Book</h3>

      <select
        value={selectedId}
        onChange={(e) => {
          setSelectedId(e.target.value);
          setMessage("");
          setError("");
        }}
      >
        <option value="">Select Book</option>
        {books.map((b) => (
          <option key={b.id} value={b.id}>
            {b.title}
          </option>
        ))}
      </select>

      <br />

      <button
        style={{ marginTop: "10px" }}
        disabled={!selectedId || loading}
        onClick={handleDelete}
      >
        {loading ? "Deleting..." : "Delete"}
      </button>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default DeleteBook;