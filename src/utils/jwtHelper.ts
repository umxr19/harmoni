import jwt, { SignOptions } from 'jsonwebtoken';

// Define a specific interface for token payload
export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: any; // Allow for additional properties if needed
}

/**
 * A simple wrapper around jwt.sign to avoid TypeScript's type checking
 */
export function signToken(
  payload: TokenPayload,
  secret: string,
  options?: SignOptions
): string {
  return jwt.sign(payload, secret, options);
} 