import "server-only";

import { hash, verify } from "@node-rs/argon2";

export const PASSWORD_HASH_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} as const;

// A valid Argon2id hash used to keep the login path timing-consistent when an account is missing.
export const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$rBZS9IeB+pAZm/PWmVp/cg$k//c5vlwacplfG2TBLkhafDM1YJfeuLos9TWYiU7uk4";

export function hashPassword(password: string): Promise<string> {
  return hash(password, PASSWORD_HASH_OPTIONS);
}

export function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  return verify(passwordHash, password);
}
