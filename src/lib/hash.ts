import bcrypt from "bcryptjs";

/**
 * Number of salt rounds for bcrypt hashing.
 * 12 rounds provides strong security while keeping hash time under 500ms.
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt.
 * @param plainPassword - The raw password string to hash.
 * @returns The bcrypt hash string.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 * Uses constant-time comparison to prevent timing attacks.
 * @param plainPassword - The raw password to verify.
 * @param hashedPassword - The stored bcrypt hash.
 * @returns True if the password matches the hash.
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
