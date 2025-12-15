import React, { useState } from "react";
import axios from "axios";
import "./AddBook.css";

function AddBook() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    published_year: "",
    copies_total: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------- Helpers ----------
  const isEmpty = (val) => !val || !val.trim();

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Custom validations
    if (isEmpty(form.title)) {
      setError("Title cannot be empty or whitespace");
      return;
    }

    if (isEmpty(form.author)) {
      setError("Author cannot be empty or whitespace");
      return;
    }

    const copies = Number(form.copies_total);
    if (!Number.isInteger(copies) || copies <= 0) {
      setError("Total copies must be a number greater than 0");
      return;
    }

    setLoading(true);

    const payload = {
      book: {
        title: form.title.trim(),
        author: form.author.trim(),
        isbn: form.isbn.trim(),
        published_year: Number(form.published_year) || 0,
        copies_total: copies
      }
    };

    try {
      await axios.post("http://localhost:3001/books", payload);

      setSuccess("Book added successfully");

      // Reset form (NO page reload)
      setForm({
        title: "",
        author: "",
        isbn: "",
        published_year: "",
        copies_total: ""
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Failed to add book. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add Book</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit} className="addbook-form">
        <div className="form-grid">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <label htmlFor="author">Author</label>
          <input
            id="author"
            type="text"
            value={form.author}
            onChange={(e) =>
              setForm({ ...form, author: e.target.value })
            }
          />

          <label htmlFor="isbn">ISBN</label>
          <input
            id="isbn"
            type="text"
            value={form.isbn}
            onChange={(e) =>
              setForm({ ...form, isbn: e.target.value })
            }
          />

          <label htmlFor="published_year">Published Year</label>
          <input
            id="published_year"
            type="number"
            value={form.published_year}
            onChange={(e) =>
              setForm({ ...form, published_year: e.target.value })
            }
          />

          <label htmlFor="copies_total" className="full-width-label">
            Total Copies
          </label>
          <input
            id="copies_total"
            type="number"
            className="full-width-input"
            value={form.copies_total}
            onChange={(e) =>
              setForm({ ...form, copies_total: e.target.value })
            }
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}

export default AddBook;