import React, { useEffect, useState } from "react";
import axios from "axios";

function ListBooks() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/books")
      .then(res => setBooks(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>Books Available</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Total Copies</th>
            <th>Available Copies</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.id}</td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.copies_total}</td>
              <td>{book.copies_available}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListBooks;