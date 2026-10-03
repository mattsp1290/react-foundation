import { ApiError } from './errors.js';

/** UTF-8 safe Basic credentials; `btoa` alone rejects non-Latin-1 input. */
export function basicAuthorization(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  return `Basic ${btoa(String.fromCodePoint(...bytes))}`;
}

export function validateRegistrationCredentials(
  username: string,
  password: string,
): string | undefined {
  const usernameBytes = new TextEncoder().encode(username).length;
  if (
    usernameBytes === 0 ||
    usernameBytes > 256 ||
    /^\p{White_Space}|\p{White_Space}$/u.test(username) ||
    username.includes(':') ||
    /[\p{Cc}]/u.test(username)
  ) {
    return 'Enter a username between 1 and 256 bytes with no surrounding whitespace, colons, or control characters.';
  }

  const passwordBytes = new TextEncoder().encode(password).length;
  if (passwordBytes === 0 || passwordBytes > 72) {
    return 'Enter a password between 1 and 72 bytes.';
  }
}

export function registrationError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Registration is unavailable. Try again.';
  }
  if (error.status === 400 || error.code === 'invalid_credentials') {
    return 'Your username or password is invalid. Check the requirements and try again.';
  }
  if (error.status === 409 || error.code === 'username_taken') {
    return 'That username is already taken. Choose another username.';
  }
  if (error.status === 503) {
    return 'Registration is temporarily unavailable. Try again.';
  }
  return 'Registration is unavailable. Try again.';
}
