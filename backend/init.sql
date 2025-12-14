-- ==========================================================
-- INIT SCRIPT FOR LIBRARY MANAGEMENT SYSTEM
-- MATCHES SQLAlchemy MODELS IN db.py
-- ==========================================================

-- 1. Create database (only if running manually)
-- CREATE DATABASE library_db;

-- 2. Connect to DB (for psql execution)
-- \c library_db;

-- ==========================================================
-- DROP TABLES (optional during local rebuild)
-- ==========================================================
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- ==========================================================
-- TABLE: books
-- ==========================================================
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn VARCHAR(32),
    published_year INT,
    copies_total INT DEFAULT 1,
    copies_available INT DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- TABLE: members
-- ==========================================================
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- TABLE: loans
-- ==========================================================
CREATE TABLE loans (
    id SERIAL PRIMARY KEY,

    -- Foreign Keys
    book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'borrowed',

    -- Due Date (matches SQLAlchemy DateTime)
    due_date TIMESTAMP,

    -- Audit columns
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- OPTIONAL INDEXES (improves performance)
-- ==========================================================
CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_book_id ON loans(book_id);
CREATE INDEX idx_loans_status ON loans(status);