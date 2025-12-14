require("dotenv").config(); // load .env if present

module.exports = {
  // ---------------------------------------
  // Network / Ports
  // ---------------------------------------
  GATEWAY_PORT: process.env.GATEWAY_PORT || 3001,
  GRPC_HOST: process.env.GRPC_HOST || "localhost",
  GRPC_PORT: process.env.GRPC_PORT || 50051,

  // ---------------------------------------
  // Other shared constants
  // ---------------------------------------
  STATUS: {
    BORROWED: "borrowed",
    RETURNED: "returned",
  },
};