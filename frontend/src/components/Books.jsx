import React, { useEffect, useState } from "react";

// ✅ FIXED: use NAMED imports (no default import)
import {
  listBooks,
  createBook,
  updateBook,
  deleteBook,
} from "../api/api";

const emptyBook = {
  title: "",
  author: "",
  isbn: "",
  published_year: "",
  copies_total: "",
};

const Books = () => {
  const [books, setBooks] = useState([]);
  const [book, setBook] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------- Load Books ----------------
  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await listBooks();
      setBooks(data || []);
    } catch (err) {
      console.error("Failed to load books", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // ---------------- Form Handling ----------------
  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setBook(emptyBook);
    setEditingId(null);
  };

  // ---------------- Create / Update ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...book,
      published_year: Number(book.published_year) || 0,
      copies_total: Number(book.copies_total) || 1,
    };

    try {
      if (editingId) {
        await updateBook(editingId, payload);
      } else {
        await createBook(payload);
      }
      resetForm();
      loadBooks();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  // ---------------- Edit ----------------
  const handleEdit = (b) => {
    setEditingId(b.id);
    setBook({
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      published_year: b.published_year,
      copies_total: b.copies_total,
    });
  };

  // ---------------- Delete ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;

    try {
      await deleteBook(id);
      loadBooks();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ---------------- UI ----------------
  return (
    <div style={{ padding: "20px" }}>
      <h2>Book Management</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          name="title"
          placeholder="Title"
          value={book.title}
          onChange={handleChange}
          required
        />
        <input
          name="author"
          placeholder="Author"
          value={book.author}
          onChange={handleChange}
        />
        <input
          name="isbn"
          placeholder="ISBN"
          value={book.isbn}
          onChange={handleChange}
        />
        <input
          name="published_year"
          placeholder="Year"
          value={book.published_year}
          onChange={handleChange}
        />
        <input
          name="copies_total"
          placeholder="Total Copies"
          value={book.copies_total}
          onChange={handleChange}
        />

        <button type="submit">
          {editingId ? "Update Book" : "Add Book"}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Year</th>
              <th>Total</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>{b.isbn}</td>
                <td>{b.published_year}</td>
                <td>{b.copies_total}</td>
                <td>{b.copies_available}</td>
                <td>
                  <button onClick={() => handleEdit(b)}>Edit</button>
                  <button onClick={() => handleDelete(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan="7">No books found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Books;