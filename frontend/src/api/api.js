// frontend/src/api/api.js
import axios from "axios";

/**
 * IMPORTANT:
 * React runs on :3000
 * Gateway runs on :3001
 * All REST APIs are exposed from Gateway
 */
const API_BASE_URL = "http://localhost:3001";

/* ===================== BOOK APIs ===================== */

export async function listBooks() {
  const res = await axios.get(`${API_BASE_URL}/books`);
  return res.data;
}

export async function createBook(book) {
  const res = await axios.post(`${API_BASE_URL}/books`, { book });
  return res.data;
}

export async function updateBook(id, book) {
  const res = await axios.put(`${API_BASE_URL}/books/${id}`, { book });
  return res.data;
}

export async function deleteBook(id) {
  const res = await axios.delete(`${API_BASE_URL}/books/${id}`);
  return res.data;
}

/* ===================== MEMBER APIs ===================== */

export async function listMembers() {
  const res = await axios.get(`${API_BASE_URL}/members`);
  return res.data;
}

export async function createMember(member) {
  const res = await axios.post(`${API_BASE_URL}/members`, { member });
  return res.data;
}

export async function updateMember(id, member) {
  const res = await axios.put(`${API_BASE_URL}/members/${id}`, { member });
  return res.data;
}

export async function deleteMember(id) {
  const res = await axios.delete(`${API_BASE_URL}/members/${id}`);
  return res.data;
}