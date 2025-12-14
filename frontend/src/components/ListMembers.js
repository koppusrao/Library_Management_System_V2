import React, { useEffect, useState } from "react";
import axios from "axios";

function ListMembers() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/members")
      .then((res) => setMembers(res.data))
      .catch((err) => console.error("Error loading members:", err));
  }, []);

  return (
    <div>
      <h2>Members List</h2>

      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.phone}</td>
                <td>{m.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ListMembers;
