import { SignJWT, jwtVerify } from "jose";

// Get the secret key from the environment variables.
//
// This key is used to sign our authentication token.
const secretKey = process.env.JWT_SECRET;

// Make sure the secret exists before the application starts using it.
if (!secretKey) {
  throw new Error("JWT_SECRET is not defined");
}

// Convert the secret string into the format required by jose.
const secret = new TextEncoder().encode(secretKey);

// Create a JWT token for a logged-in user.
export async function createAuthToken(userId: string) {
  // Create and sign the token.
  return await new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// Verify an authentication token.
export async function verifyAuthToken(token: string) {
  try {
    // Verify that the token was created by our application
    // and has not expired.
    const { payload } = await jwtVerify(token, secret);

    // Make sure the token contains a userId.
    if (typeof payload.userId !== "string") {
      return null;
    }

    // Return the logged-in user's ID.
    return payload.userId;
  } catch {
    // If the token is invalid or expired,
    // return null instead of crashing the application.
    return null;
  }
}