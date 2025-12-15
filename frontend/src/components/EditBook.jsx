import React, { useEffect, useMemo, useState } from "react";
import { listBooks, updateBook } from "../api/api";

const EditBook = () => {
  const [books, setBooks] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [book, setBook] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---------------- Load books ----------------
  const loadBooks = async () => {
    try {
      const data = await listBooks();
      setBooks(data || []);
    } catch {
      setError("Failed to load books");
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // ---------------- Dropdown books (UNIQUE BY TITLE) ----------------
  const dropdownBooks = useMemo(() => {
    const map = new Map();

    (books || []).forEach((b) => {
      const key = (b.title || "").trim().toLowerCase();

      // keep the latest/highest id for the same title
      if (!map.has(key) || map.get(key).id < b.id) {
        map.set(key, b);
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      (a.title || "").localeCompare(b.title || "")
    );
  }, [books]);

  // ---------------- Select book ----------------
  const handleSelect = (e) => {
    const id = Number(e.target.value);
    setSelectedId(id);
    setMessage("");
    setError("");

    if (!id) {
      setBook(null);
      return;
    }

    const found = books.find((b) => b.id === id);
    if (!found) {
      setBook(null);
      return;
    }

    setBook({
      id: found.id,
      title: found.title || "",
      author: found.author || "",
      isbn: found.isbn || "",
      published_year: found.published_year || "",
      copies_total: found.copies_total || 0,
      copies_available: found.copies_available || 0,
    });
  };

  // ---------------- Field change ----------------
  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  // ---------------- Update (SAFE LOGIC) ----------------
  const handleUpdate = async () => {
    setMessage("");
    setError("");

    const title = book.title?.trim();
    const author = book.author?.trim();
    const isbn = book.isbn?.trim();
    const publishedYear = Number(book.published_year);
    const totalCopies = Number(book.copies_total);

    // Mandatory validation
    if (!title || !author || !isbn) {
      setError("Title, Author and ISBN are mandatory.");
      return;
    }

    if (!publishedYear || publishedYear <= 0) {
      setError("Published Year must be a valid number.");
      return;
    }

    if (!Number.isInteger(totalCopies) || totalCopies <= 0) {
      setError("Total Copies must be greater than zero.");
      return;
    }

    // Borrowed safety check
    const borrowedCount =
      Number(book.copies_total) - Number(book.copies_available);

    if (totalCopies < borrowedCount) {
      setError(
        `Total copies cannot be less than borrowed books (${borrowedCount}).`
      );
      return;
    }

    try {
      await updateBook(selectedId, {
        title,
        author,
        isbn,
        published_year: publishedYear,
        copies_total: totalCopies,
      });

      setMessage("Changes are updated for Books");
      await loadBooks();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Update failed. Please check values."
      );
    }
  };

  return (
    <div style={{ padding: "10px", maxWidth: "400px" }}>
      <h3>Edit Book</h3>

      <div style={{ marginBottom: "10px" }}>
        <label>Select Book</label><br />
        <select value={selectedId} onChange={handleSelect}>
          <option value="">Select Book</option>
          {dropdownBooks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      </div>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {book && (
        <>
          <div>
            <label>Title</label><br />
            <input name="title" value={book.title} onChange={handleChange} />
          </div>

          <div>
            <label>Author</label><br />
            <input name="author" value={book.author} onChange={handleChange} />
          </div>

          <div>
            <label>ISBN</label><br />
            <input name="isbn" value={book.isbn} onChange={handleChange} />
          </div>

          <div>
            <label>Published Year</label><br />
            <input
              name="published_year"
              type="number"
              value={book.published_year}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Total Copies</label><br />
            <input
              name="copies_total"
              type="number"
              value={book.copies_total}
              onChange={handleChange}
            />
          </div>

          <button style={{ marginTop: "10px" }} onClick={handleUpdate}>
            Update
          </button>
        </>
      )}
    </div>
  );
};

export default EditBook;