import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RegisterForm } from './RegisterForm.js';

const submit = () => screen.getByRole('button', { name: 'Create account' });

describe('RegisterForm', () => {
  it('keeps the contract ids, hints and requirements copy', () => {
    render(<RegisterForm pending={false} onSubmit={vi.fn()} />);
    const username = screen.getByLabelText('Username');
    const password = screen.getByLabelText('Password');
    expect(username).toHaveAttribute('id', 'register-username');
    expect(username).toHaveAttribute('autocomplete', 'username');
    expect(username).toHaveAttribute(
      'aria-describedby',
      'register-requirements',
    );
    expect(username).toHaveAccessibleDescription(
      'Usernames use 1–256 UTF-8 bytes and cannot have surrounding whitespace, colons, or control characters. Passwords use 1–72 UTF-8 bytes.',
    );
    expect(password).toHaveAttribute('id', 'register-password');
    expect(password).toHaveAttribute('type', 'password');
    expect(password).toHaveAttribute('autocomplete', 'new-password');
    expect(username.closest('form')).toHaveAttribute('novalidate');
  });

  it('blocks a username with a leading space', async () => {
    const onSubmit = vi.fn();
    render(<RegisterForm pending={false} onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), ' leading-space');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(submit());
    expect(screen.getByRole('alert')).toHaveTextContent(
      'surrounding whitespace',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks an empty password', async () => {
    const onSubmit = vi.fn();
    render(<RegisterForm pending={false} onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), 'bird');
    await user.click(submit());
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a password between 1 and 72 bytes.',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the exact credential pair', async () => {
    const onSubmit = vi.fn();
    render(<RegisterForm pending={false} onSubmit={onSubmit} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), '﻿nest builder');
    await user.type(screen.getByLabelText('Password'), ' secret ');
    await user.click(submit());
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('﻿nest builder', ' secret ');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('clears the validation alert on input and notifies the host', async () => {
    const onChange = vi.fn();
    render(
      <RegisterForm pending={false} onSubmit={vi.fn()} onChange={onChange} />,
    );
    const user = userEvent.setup();
    await user.click(submit());
    expect(screen.getByRole('alert')).toBeVisible();
    expect(onChange).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Username'), 'b');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(1);
    await user.type(screen.getByLabelText('Password'), 's');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('shows the host error when the credentials are valid', () => {
    render(
      <RegisterForm
        pending={false}
        error="That username is already taken. Choose another username."
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('already taken');
  });

  it('shows exactly one alert, the validation message, over a host error', async () => {
    render(
      <RegisterForm
        pending={false}
        error="That username is already taken. Choose another username."
        onSubmit={vi.fn()}
      />,
    );
    await userEvent.setup().click(submit());
    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toHaveTextContent(/^Enter a username between/);
  });

  it('disables the button and changes its name while pending', () => {
    render(<RegisterForm pending onSubmit={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: 'Creating account…' }),
    ).toBeDisabled();
  });
});
