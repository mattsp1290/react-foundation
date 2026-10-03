import type { FormEvent } from 'react';
import { useState } from 'react';
import { ErrorMessage } from './ErrorMessage.js';
import { TextField } from './TextField.js';

/**
 * Login form for the Birb browser session. The ids (`username`, `password`)
 * and the copy are fixed contract text, so render at most one per document.
 */
export function LoginForm({
  initialUsername,
  pending,
  error,
  onSubmit,
}: {
  initialUsername?: string;
  pending: boolean;
  error?: boolean;
  onSubmit: (username: string, password: string) => void;
}) {
  const [username, setUsername] = useState(() => initialUsername ?? '');
  const [password, setPassword] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(username, password);
  };
  return (
    <form onSubmit={submit}>
      <TextField
        id="username"
        label="Username"
        autoComplete="username"
        value={username}
        onChange={setUsername}
        required
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        required
      />
      {error && (
        <ErrorMessage>
          Login failed. Check your credentials and try again.
        </ErrorMessage>
      )}
      <button type="submit" disabled={pending}>
        {pending ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
