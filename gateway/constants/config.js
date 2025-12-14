// gateway/constants/config.js

require("dotenv").config();
const logger = require("../logger");

// Helper: validate and warn if env variable is missing
function env(name, fallback) {
  const value = process.env[name];
  if (!value) {
    logger.warn(`ENV variable ${name} not set — using fallback: ${fallback}`);
    return fallback;
  }
  return value;
}

module.exports = {
  // -----------------------------
  // gRPC Backend Config
  // -----------------------------
  GRPC_HOST: env("GRPC_HOST", "localhost"),
  GRPC_PORT: env("GRPC_PORT", "50051"),

  // -----------------------------
  // Node API Gateway Port (used by app.listen)
  // -----------------------------
  API_PORT: Number(env("GATEWAY_PORT", 3001)),
};