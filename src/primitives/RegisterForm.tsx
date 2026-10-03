import type { FormEvent } from 'react';
import { useState } from 'react';
import { validateRegistrationCredentials } from '../session/credentials.js';
import { ErrorMessage } from './ErrorMessage.js';
import { TextField } from './TextField.js';

/**
 * Registration form for the Birb browser session. Credentials are validated
 * before `onSubmit`; a validation message takes the place of the host's
 * `error`, so at most one alert exists. `onChange` fires on every edit, also
 * while `pending`; a host that resets its mutation there should do so only
 * when the mutation has failed. The ids and the copy are fixed contract text,
 * so render at most one per document.
 */
export function RegisterForm({
  pending,
  error,
  onSubmit,
  onChange,
}: {
  pending: boolean;
  error?: string;
  onSubmit: (username: string, password: string) => void;
  onChange?: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string>();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalid = validateRegistrationCredentials(username, password);
    setValidationError(invalid);
    if (!invalid) onSubmit(username, password);
  };
  const edit = (set: (value: string) => void) => (value: string) => {
    set(value);
    setValidationError(undefined);
    onChange?.();
  };
  const message = validationError ?? error;
  return (
    <form onSubmit={submit} noValidate>
      <TextField
        id="register-username"
        label="Username"
        autoComplete="username"
        value={username}
        onChange={edit(setUsername)}
        description="Usernames use 1–256 UTF-8 bytes and cannot have surrounding whitespace, colons, or control characters. Passwords use 1–72 UTF-8 bytes."
        descriptionId="register-requirements"
        required
      />
      <TextField
        id="register-password"
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={edit(setPassword)}
        required
      />
      {message && <ErrorMessage>{message}</ErrorMessage>}
      <button type="submit" disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
