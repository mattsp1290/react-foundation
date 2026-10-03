import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm.js';

describe('LoginForm', () => {
  it('submits the typed username and password unchanged', async () => {
    const onSubmit = vi.fn();
    render(<LoginForm pending={false} onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), ' søren ');
    await user.type(screen.getByLabelText('Password'), 'se:cret ');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(' søren ', 'se:cret ');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('keeps the contract ids, types and autocomplete hints', () => {
    render(
      <LoginForm initialUsername="bird" pending={false} onSubmit={vi.fn()} />,
    );
    const username = screen.getByLabelText('Username');
    const password = screen.getByLabelText('Password');
    expect(username).toHaveAttribute('id', 'username');
    expect(username).toHaveAttribute('autocomplete', 'username');
    expect(username).toHaveValue('bird');
    expect(username).toBeRequired();
    expect(password).toHaveAttribute('id', 'password');
    expect(password).toHaveAttribute('type', 'password');
    expect(password).toHaveAttribute('autocomplete', 'current-password');
    expect(password).toBeRequired();
  });

  it('disables the button and changes its name while pending', () => {
    render(<LoginForm pending onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Logging in…' })).toBeDisabled();
  });

  it('renders the failure alert when error is set', () => {
    render(<LoginForm pending={false} error onSubmit={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Login failed. Check your credentials and try again.',
    );
  });
});
