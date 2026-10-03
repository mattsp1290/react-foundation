import { describe, expect, it } from 'vitest';
import {
  registrationError,
  validateRegistrationCredentials,
} from './credentials.js';
import { ApiError } from './errors.js';

const usernameMessage = /^Enter a username between 1 and 256 bytes/;
const passwordMessage = 'Enter a password between 1 and 72 bytes.';

describe('validateRegistrationCredentials', () => {
  it('accepts the byte-length boundaries', () => {
    expect(
      validateRegistrationCredentials('a'.repeat(256), 'p'.repeat(72)),
    ).toBeUndefined();
    expect(validateRegistrationCredentials('a', 'p')).toBeUndefined();
  });

  it('counts UTF-8 bytes rather than characters', () => {
    // "é" is two bytes: 128 of them fit, 129 do not.
    expect(
      validateRegistrationCredentials('é'.repeat(128), 'p'),
    ).toBeUndefined();
    expect(validateRegistrationCredentials('é'.repeat(129), 'p')).toMatch(
      usernameMessage,
    );
    expect(
      validateRegistrationCredentials('a', 'é'.repeat(36)),
    ).toBeUndefined();
    expect(validateRegistrationCredentials('a', 'é'.repeat(37))).toBe(
      passwordMessage,
    );
  });

  it.each([
    ['empty', ''],
    ['257 bytes', 'a'.repeat(257)],
    ['leading space', ' bird'],
    ['trailing space', 'bird '],
    ['surrounding no-break space', ' bird'],
    ['colon', 'bi:rd'],
    ['control character', 'bi\u0007rd'],
  ])('rejects a username with %s', (_, username) => {
    expect(validateRegistrationCredentials(username, 'secret')).toMatch(
      usernameMessage,
    );
  });

  it('accepts interior whitespace and a leading U+FEFF', () => {
    expect(
      validateRegistrationCredentials('nest builder', 'p'),
    ).toBeUndefined();
    expect(validateRegistrationCredentials('﻿birb', 'p')).toBeUndefined();
  });

  it.each([
    ['empty', ''],
    ['73 bytes', 'p'.repeat(73)],
  ])('rejects a password that is %s', (_, password) => {
    expect(validateRegistrationCredentials('bird', password)).toBe(
      passwordMessage,
    );
  });
});

describe('registrationError', () => {
  it.each([
    [new ApiError(400), /username or password is invalid/],
    [
      new ApiError(422, 'invalid_credentials'),
      /username or password is invalid/,
    ],
    [new ApiError(409), /already taken/],
    [new ApiError(500, 'username_taken'), /already taken/],
    [new ApiError(503), /^Registration is temporarily unavailable/],
    [new ApiError(500), /^Registration is unavailable/],
    [new TypeError('network'), /^Registration is unavailable/],
  ])('maps %o', (error, message) => {
    expect(registrationError(error)).toMatch(message);
  });
});
