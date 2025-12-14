// ======================================================
// gateway/index.js
// ======================================================
const express = require("express");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const { v4: uuidv4 } = require("uuid");
const logger = require("./logger");

// Centralized config
const { GRPC_HOST, GRPC_PORT, API_PORT } = require("./constants/config");

// ======================================================
// Load Proto
// ======================================================
const PROTO_PATH = path.resolve(__dirname, "../backend/proto/library.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const proto = grpcObject.library;

if (!proto || !proto.Library) {
  console.error("gRPC Library service not found. Check proto package name.");
  process.exit(1);
}

// ======================================================
// gRPC Client
// ======================================================
const client = new proto.Library(
  `${GRPC_HOST}:${GRPC_PORT}`,
  grpc.credentials.createInsecure()
);

const app = express();
app.use(cors());
app.use(express.json());

// ======================================================
// Helpers
// ======================================================
function isPositiveInt(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0;
}

function parseDateStringSafe(dateStr, reqId = null) {
  if (!dateStr || typeof dateStr !== "string") return null;

  const parts = dateStr.split("-");
  if (parts.length !== 3) {
    if (reqId) logger.warn("Invalid date format", { reqId, dateStr });
    return null;
  }

  const [yy, mm, dd] = parts.map(Number);
  if (!yy || !mm || !dd || mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    if (reqId) logger.warn("Invalid numeric date values", { reqId, dateStr });
    return null;
  }

  return { year: yy, month: mm, day: dd };
}

// ======================================================
// gRPC → HTTP Error Mapper
// ======================================================
function mapGrpcError(err) {
  switch (err.code) {
    case grpc.status.INVALID_ARGUMENT:
      return { status: 400, message: "Invalid request" };
    case grpc.status.NOT_FOUND:
      return { status: 404, message: "Resource not found" };
    case grpc.status.ALREADY_EXISTS:
      return { status: 409, message: err.message || "Already exists" };
    case grpc.status.FAILED_PRECONDITION:
      return { status: 409, message: err.message || "Operation not allowed" };
    case grpc.status.UNAUTHENTICATED:
      return { status: 401, message: "Authentication required" };
    case grpc.status.PERMISSION_DENIED:
      return { status: 403, message: "Permission denied" };
    default:
      return { status: 500, message: "Internal server error" };
  }
}

// ======================================================
// Request Logging Middleware
// ======================================================
app.use((req, res, next) => {
  req.requestId = uuidv4();

  logger.info(`[REQ] ${req.method} ${req.url}`, {
    reqId: req.requestId,
    body: req.body,
    query: req.query,
  });

  res.on("finish", () => {
    logger.info(`[RES] ${req.method} ${req.url} → ${res.statusCode}`, {
      reqId: req.requestId,
    });
  });

  next();
});

// ======================================================
// Shared gRPC Adapter
// ======================================================
function grpcCall(method, req, res, payload, transform = null) {
  logger.info(`[gRPC →] ${method}`, {
    reqId: req.requestId,
    payload,
  });

  client[method](payload, (err, response) => {
    if (err) {
      const mapped = mapGrpcError(err);

      logger.error(`[gRPC ERROR] ${method}`, {
        reqId: req.requestId,
        grpcCode: err.code,
        grpcMessage: err.message,
        httpStatus: mapped.status,
      });

      return res.status(mapped.status).send({ message: mapped.message });
    }

    if (!response) return res.send([]);

    if (transform) {
      try {
        response = transform(response);
      } catch (e) {
        logger.error("Transform error", {
          reqId: req.requestId,
          error: e.message,
        });
        return res.status(500).send({ message: "Response processing error" });
      }
    }

    res.send(response);
  });
}

// ======================================================
// BOOK MANAGEMENT
// ======================================================
app.get("/books", (req, res) => {
  grpcCall("ListBooks", req, res, {}, (r) => r.books || []);
});

app.get("/available-books", (req, res) => {
  grpcCall("ListBooks", req, res, {}, (r) =>
    (r.books || []).filter((b) => Number(b.copies_available) > 0)
  );
});

app.post("/books", (req, res) => {
  const { book } = req.body;
  if (!book) return res.status(400).send({ message: "book payload missing" });
  grpcCall("CreateBook", req, res, { book }, (r) => r.book);
});

app.put("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isPositiveInt(id)) {
    return res.status(400).send({ message: "Invalid book id" });
  }

  grpcCall(
    "UpdateBook",
    req,
    res,
    {
      id,
      title: req.body.book?.title || "",
      author: req.body.book?.author || "",
      isbn: req.body.book?.isbn || "",
      published_year: Number(req.body.book?.published_year) || 0,
      copies_total: Number(req.body.book?.copies_total) || 0,
    },
    (r) => r.book
  );
});

app.delete("/books/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isPositiveInt(id)) {
    return res.status(400).send({ message: "Invalid book id" });
  }

  grpcCall("DeleteBook", req, res, { id }, () => ({ success: true }));
});

// ======================================================
// MEMBER MANAGEMENT  (FIXED)
// ======================================================
app.get("/members", (req, res) => {
  grpcCall("ListMembers", req, res, {}, (r) => r.members || []);
});

app.post("/members", (req, res) => {
  const { member } = req.body;
  if (!member) return res.status(400).send({ message: "member payload missing" });
  grpcCall("CreateMember", req, res, { member }, (r) => r.member);
});

app.put("/members/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isPositiveInt(id)) {
    return res.status(400).send({ message: "Invalid member id" });
  }

  const member = req.body.member || {};

  grpcCall(
    "UpdateMember",
    req,
    res,
    {
      id,
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      address: member.address || "",
    },
    (r) => r.member
  );
});

app.delete("/members/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isPositiveInt(id)) {
    return res.status(400).send({ message: "Invalid member id" });
  }

  grpcCall("DeleteMember", req, res, { id }, () => ({ success: true }));
});

// ======================================================
// LOANS
// ======================================================
app.post("/borrow", (req, res) => {
  const { book_id, member_id, due_date } = req.body;

  if (!isPositiveInt(book_id) || !isPositiveInt(member_id)) {
    return res.status(400).send({ message: "Invalid IDs" });
  }

  const payload = { book_id, member_id };
  const parsed = parseDateStringSafe(due_date, req.requestId);
  if (parsed) payload.due_date = parsed;

  grpcCall("BorrowBook", req, res, payload, (r) => r.loan);
});

app.post("/return", (req, res) => {
  const { loan_id } = req.body;
  if (!isPositiveInt(loan_id)) {
    return res.status(400).send({ message: "Invalid loan id" });
  }

  grpcCall("ReturnBook", req, res, { loan_id }, (r) => r.loan);
});

// ======================================================
// REPORTS
// ======================================================
app.get("/loans", (req, res) => {
  const member_id = Number(req.query.member_id || 0);

  if (member_id > 0) {
    grpcCall("ListLoansForMember", req, res, { member_id }, (r) => r.loans || []);
    return;
  }

  grpcCall("ListAllLoans", req, res, {}, (r) => r.loans || []);
});

// ======================================================
// Start Server
// ======================================================
app.listen(API_PORT, () => {
  console.log(`Node Gateway running on port ${API_PORT}`);
  logger.info(`Node Gateway running on port ${API_PORT}`);
});