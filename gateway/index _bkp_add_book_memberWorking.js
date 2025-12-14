const express = require("express");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// ---------------- Load Proto ----------------
const PROTO_PATH = path.resolve(__dirname, "../backend/proto/library.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [
    path.resolve(__dirname, "../backend/proto"), // local proto folder
  ],
});

const proto = grpc.loadPackageDefinition(packageDefinition).library;

// ---------------- gRPC Client ----------------
const client = new proto.Library(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- Logging Middleware ----------------
app.use((req, res, next) => {
  console.log(`>>> Incoming Request: ${req.method} ${req.url}`);
  next();
});

// ---------------- Helper: Convert "YYYY-MM-DD" string to google.type.Date ----------------
function parseDateString(dateStr) {
  if (!dateStr) return null;

  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);
  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
}

// ---------------- gRPC Helper Function ----------------
function grpcCall(method, reqObj, res, transform = null) {
  client[method](reqObj, (err, response) => {
    if (err) {
      console.error(`❌ ${method} gRPC Error:`, err);
      return res.status(500).send({
        message: "Backend error",
        grpc_error: err.message,
        code: err.code,
      });
    }

    if (!response) {
      console.error(`❌ ${method} returned EMPTY response`);
      return res.status(500).send({ message: "Empty response from gRPC server" });
    }

    if (transform) {
      try {
        response = transform(response);
      } catch (transformErr) {
        console.error(`❌ Transform Error in ${method}:`, transformErr);
        return res.status(500).send({
          message: "Transform error",
          detail: transformErr.toString(),
        });
      }
    }

    res.send(response);
  });
}

// ---------------- API Endpoints ----------------

// List All Books
app.get("/books", (req, res) => {
  grpcCall("ListBooks", {}, res, (r) => r.books || []);
});

// List Only Available Books
app.get("/available-books", (req, res) => {
  grpcCall("ListBooks", {}, res, (r) => {
    const allBooks = r.books || [];
    return allBooks.filter((b) => Number(b.copies_available) > 0);
  });
});

// List Members
app.get("/members", (req, res) => {
  grpcCall("ListMembers", {}, res, (r) => r.members || []);
});

// Create Book
app.post("/books", (req, res) => {
  const { book } = req.body;
  const payload = {
    book: {
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      published_year: Number(book.published_year) || 0,
      copies_total: Number(book.copies_total) || 1,
    },
  };
  grpcCall("CreateBook", payload, res, (r) => r.book);
});

// Create Member
app.post("/members", (req, res) => {
  const { member } = req.body;
  const payload = {
    member: {
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      address: member.address || "",
    },
  };
  grpcCall("CreateMember", payload, res, (r) => r.member);
});

// ---------------- Borrow Book ----------------
app.post("/borrow", (req, res) => {
  const { book_id, member_id, due_date } = req.body;

  if (!book_id || !member_id || !due_date) {
    return res.status(400).send({
      message: "book_id, member_id, and due_date are required",
    });
  }

  const pbDueDate = parseDateString(due_date);
  if (!pbDueDate) {
    return res.status(400).send({ message: "Invalid due_date format. Use YYYY-MM-DD." });
  }

  const payload = {
    book_id: Number(book_id),
    member_id: Number(member_id),
    due_date: pbDueDate,
  };

  console.log("Borrow Payload:", payload);
  grpcCall("BorrowBook", payload, res, (r) => r.loan);
});

// ---------------- Return Book ----------------
app.post("/return", (req, res) => {
  const { loan_id } = req.body;

  if (!loan_id) {
    return res.status(400).send({ message: "loan_id is required" });
  }

  const payload = { loan_id: Number(loan_id) };
  console.log("Return Payload:", payload);
  grpcCall("ReturnBook", payload, res, (r) => r.loan);
});

// ---------------- List All Loans (paged) ----------------
app.get("/loans", (req, res) => {
  const page = Number(req.query.page) || 1;
  const size = Number(req.query.pageSize) || 20;

  grpcCall("ListAllLoans", {}, res, (r) => {
    const loans = r.loans || [];
    const start = (page - 1) * size;
    return {
      total: loans.length,
      page,
      pageSize: size,
      loans: loans.slice(start, start + size),
    };
  });
});

// ---------------- Start Server ----------------
app.listen(3001, () => console.log("Node Gateway running on port 3001"));
