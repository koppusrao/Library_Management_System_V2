import { useEffect, useState } from "react";
import axios from "axios";

export default function ListBooks() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/books")
      .then(res => setBooks(res.data));
  }, []);

  return (
    <div>
      <h2>Books</h2>
      <ul>
        {books.map(b => (
          <li key={b.id}>{b.title} - {b.author}</li>
        ))}
      </ul>
    </div>
  );
}
