import React, { useEffect, useState } from "react";
import { listMembers, deleteMember } from "../api/api";

const DeleteMember = () => {
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---------------- Load members (A–Z) ----------------
  useEffect(() => {
    const load = async () => {
      try {
        const data = await listMembers();
        const sorted = [...(data || [])].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
        setMembers(sorted);
      } catch (e) {
        setError("Failed to load members");
      }
    };
    load();
  }, []);

  // ---------------- Delete ----------------
  const handleDelete = async () => {
    setMessage("");
    setError("");

    if (!selectedId) {
      setError("Please select a member");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this member?")) {
      return;
    }

    try {
      await deleteMember(selectedId);
      setMessage("Member deleted successfully");
      setSelectedId("");

      // Refresh dropdown
      const refreshed = await listMembers();
      const sorted = [...(refreshed || [])].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      setMembers(sorted);

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Cannot delete member. Active borrowed books exist."
      );
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <h3>Delete Member</h3>

      {/* -------- Member Selector -------- */}
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
        <option value="">Select Member</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {/* -------- Messages -------- */}
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleDelete}>
          Delete Member
        </button>
      </div>
    </div>
  );
};

export default DeleteMember;