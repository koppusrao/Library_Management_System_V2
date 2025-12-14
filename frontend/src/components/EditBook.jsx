import React, { useEffect, useState } from "react";
import { listBooks, updateBook } from "../api/api";

const EditBook = () => {
  const [books, setBooks] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [book, setBook] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const handleSelect = (e) => {
    const id = Number(e.target.value);
    setSelectedId(id);
    setMessage("");
    setError("");

    const found = books.find((b) => b.id === id);
    if (!found) {
      setBook(null);
      return;
    }

    setBook({
      title: found.title || "",
      author: found.author || "",
      isbn: found.isbn || "",
      published_year: found.published_year || "",
      copies_total: found.copies_total || "",
    });
  };

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setMessage("");
    setError("");

    try {
      await updateBook(selectedId, {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        published_year: Number(book.published_year) || 0,
        copies_total: Number(book.copies_total) || 0,
      });

      setMessage("Changes are updated for Books");

      const refreshed = await listBooks();
      setBooks(
        [...(refreshed || [])].sort((a, b) =>
          a.title.localeCompare(b.title)
        )
      );
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
          {books.map((b) => (
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
            <input
              name="title"
              value={book.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Author</label><br />
            <input
              name="author"
              value={book.author}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>ISBN</label><br />
            <input
              name="isbn"
              value={book.isbn}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Published Year</label><br />
            <input
              name="published_year"
              value={book.published_year}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Total Copies</label><br />
            <input
              name="copies_total"
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