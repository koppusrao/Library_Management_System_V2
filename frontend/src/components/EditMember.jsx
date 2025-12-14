import React, { useEffect, useState } from "react";
import { listMembers, updateMember } from "../api/api";

const EditMember = () => {
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [member, setMember] = useState(null);
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

  // ---------------- Select member ----------------
  const handleSelect = (e) => {
    const id = Number(e.target.value);
    setSelectedId(id);
    setMessage("");
    setError("");

    const found = members.find((m) => m.id === id);
    if (!found) {
      setMember(null);
      return;
    }

    setMember({
      name: found.name || "",
      email: found.email || "",
      phone: found.phone || "",
      address: found.address || "",
    });
  };

  // ---------------- Field change ----------------
  const handleChange = (e) => {
    setMember({
      ...member,
      [e.target.name]: e.target.value,
    });
  };

  // ---------------- Update ----------------
  const handleUpdate = async () => {
    setMessage("");
    setError("");

    try {
      await updateMember(selectedId, {
        name: member.name,
        email: member.email,
        phone: member.phone,
        address: member.address,
      });

      setMessage("Changes are updated for Member");

      // Refresh dropdown data
      const refreshed = await listMembers();
      const sorted = [...(refreshed || [])].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
      setMembers(sorted);

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Update failed. Email may already exist."
      );
    }
  };

  return (
    <div style={{ padding: "10px" }}>
      <h3>Edit Member</h3>

      {/* -------- Member Selector -------- */}
      <select value={selectedId} onChange={handleSelect}>
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

      {/* -------- Edit Form -------- */}
      {member && (
        <div style={{ marginTop: "10px" }}>
          <div>
            <label>Name</label><br />
            <input
              name="name"
              value={member.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Email</label><br />
            <input
              name="email"
              value={member.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Phone</label><br />
            <input
              name="phone"
              value={member.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Address</label><br />
            <input
              name="address"
              value={member.address}
              onChange={handleChange}
            />
          </div>

          <button style={{ marginTop: "10px" }} onClick={handleUpdate}>
            Update
          </button>
        </div>
      )}
    </div>
  );
};

export default EditMember;