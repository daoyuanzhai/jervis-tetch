import { createHash } from "crypto";

function hashPassword(password) {
  const hash = createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
}

export { hashPassword };
