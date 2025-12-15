import React, { useState } from "react";
import axios from "axios";
import "./AddMember.css";

function AddMember() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------- Helpers ----------
  const isEmpty = (val) => !val || !val.trim();

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Custom validations
    if (isEmpty(form.name)) {
      setError("Name cannot be empty or whitespace");
      return;
    }

    if (isEmpty(form.email)) {
      setError("Email cannot be empty");
      return;
    }

    if (!isValidEmail(form.email.trim())) {
      setError("Invalid email format");
      return;
    }

    setLoading(true);

    const payload = {
      member: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim()
      }
    };

    try {
      await axios.post("http://localhost:3001/members", payload);

      setSuccess("Member added successfully");

      // Reset form
      setForm({
        name: "",
        email: "",
        phone: "",
        address: ""
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Failed to add member. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add Member</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit} className="addmember-form">
        <div className="form-grid">
          <label>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <label>Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <label>Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
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

export default AddMember;