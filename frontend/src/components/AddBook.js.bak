import React, { useState } from "react";
import axios from "axios";
import "./AddBook.css";

function AddBook() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    published_year: "",
    copies_total: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      book: {
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        published_year: Number(form.published_year) || 0,
        copies_total: Number(form.copies_total) || 0
      }
    };

    axios.post("http://localhost:3001/books", payload)
      .then(() => {
        alert("Book created!");
        window.location.reload();
      })
      .catch(err => console.log("Error:", err));
  };

  return (
    <div>
      <h2>Add Book</h2>
      <form onSubmit={handleSubmit} className="addbook-form">

        <div className="form-grid">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <label htmlFor="author">Author</label>
          <input
            id="author"
            type="text"
            required
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />

          <label htmlFor="isbn">ISBN</label>
          <input
            id="isbn"
            type="text"
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
          />

          <label htmlFor="published_year">Published Year</label>
          <input
            id="published_year"
            type="number"
            value={form.published_year}
            onChange={(e) => setForm({ ...form, published_year: e.target.value })}
          />

          <label htmlFor="copies_total" className="full-width-label">Total Copies</label>
          <input
            id="copies_total"
            type="number"
            required
            className="full-width-input"
            value={form.copies_total}
            onChange={(e) => setForm({ ...form, copies_total: e.target.value })}
          />
        </div>

        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default AddBook;