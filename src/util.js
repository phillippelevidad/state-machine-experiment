import crypto from "crypto";

export function simulateAsyncOperation(
  successCallback,
  errorCallback = null,
  isSuccess = true
) {
  const MIN_DELAY = 50;
  const MAX_DELAY = 100;
  return new Promise((resolve, reject) => {
    const delay =
      Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
    setTimeout(() => {
      if (errorCallback && !isSuccess) reject(errorCallback());
      else resolve(successCallback());
    }, delay);
  });
}

export function generateIdempotencyKey(obj) {
  // Serialize the object keys and values in a consistent order
  const sortedKeys = Object.keys(obj).sort();
  const serializedObj = sortedKeys.map((key) => `${key}:${obj[key]}`).join("|");

  // Include a timestamp (e.g., to the nearest hour)
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const timestamp = `${year}-${month}-${day}-${hour}`;

  // Concatenate the serialized object and timestamp
  const data = `${serializedObj}|${timestamp}`;

  // Generate a SHA-256 hash
  return crypto.createHash("sha256").update(data).digest("hex");
}

export default {
  simulateAsyncOperation,
  generateIdempotencyKey,
};
