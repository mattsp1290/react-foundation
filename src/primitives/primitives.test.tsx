import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell.js';
import { ErrorMessage } from './ErrorMessage.js';
import { Panel } from './Panel.js';
import { StatusMessage } from './StatusMessage.js';
import { TextField } from './TextField.js';

function Field(props: { description?: string; descriptionId?: string }) {
  const [value, setValue] = useState('');
  return (
    <TextField
      id="nest"
      label="Nest name"
      value={value}
      onChange={setValue}
      {...props}
    />
  );
}

describe('AppShell', () => {
  it('renders the masthead, main and footer in order with the given link', () => {
    const { container } = render(
      <AppShell titleLink={<a href="/">Birb Party</a>} footer="Revision: abc">
        <p>content</p>
      </AppShell>,
    );
    const shell = container.querySelector('.app-shell')!;
    expect([...shell.children].map((child) => child.tagName)).toEqual([
      'HEADER',
      'MAIN',
      'FOOTER',
    ]);
    expect(shell.querySelector('header')).toHaveClass('masthead');
    expect(
      within(screen.getByRole('banner')).getByRole('link', {
        name: 'Birb Party',
      }),
    ).toHaveAttribute('href', '/');
    expect(screen.getByRole('main')).toHaveTextContent('content');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Revision: abc');
  });
});

describe('Panel', () => {
  it('labels the section by its heading id', () => {
    render(
      <Panel heading="Account" headingId="account-heading">
        <p>body</p>
      </Panel>,
    );
    const region = screen.getByRole('region', { name: 'Account' });
    expect(region).toHaveClass('panel');
    expect(region.className).toBe('panel');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Account' }),
    ).toHaveAttribute('id', 'account-heading');
  });

  it('appends an extra class', () => {
    render(
      <Panel heading="Videos" headingId="videos-heading" className="wide">
        body
      </Panel>,
    );
    expect(screen.getByRole('region', { name: 'Videos' }).className).toBe(
      'panel wide',
    );
  });
});

describe('messages', () => {
  it('exposes a status role', () => {
    render(<StatusMessage>Saved.</StatusMessage>);
    expect(screen.getByRole('status')).toHaveTextContent('Saved.');
  });

  it('exposes a live alert by default', () => {
    render(<ErrorMessage>Failed.</ErrorMessage>);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed.');
    expect(screen.getByRole('alert')).toHaveClass('error');
  });

  it('renders static error text when not live', () => {
    render(<ErrorMessage live={false}>Failure reason: codec</ErrorMessage>);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Failure reason: codec')).toHaveClass('error');
  });
});

describe('TextField', () => {
  it('associates the label and reports typed values', async () => {
    render(<Field />);
    const input = screen.getByLabelText('Nest name');
    expect(input).toHaveAttribute('id', 'nest');
    expect(input).not.toHaveAttribute('aria-describedby');
    await userEvent.setup().type(input, 'oak');
    expect(input).toHaveValue('oak');
  });

  it('describes the input with a default description id', () => {
    render(<Field description="Shown to other birds." />);
    expect(screen.getByLabelText('Nest name')).toHaveAccessibleDescription(
      'Shown to other birds.',
    );
    expect(screen.getByText('Shown to other birds.')).toHaveAttribute(
      'id',
      'nest-description',
    );
  });

  it('honors an explicit description id', () => {
    render(<Field description="Help." descriptionId="nest-help" />);
    expect(screen.getByLabelText('Nest name')).toHaveAttribute(
      'aria-describedby',
      'nest-help',
    );
    expect(screen.getByText('Help.')).toHaveAttribute('id', 'nest-help');
  });

  it('passes through type, autocomplete, required and disabled', () => {
    render(
      <TextField
        id="secret"
        label="Secret"
        type="password"
        autoComplete="new-password"
        value=""
        onChange={vi.fn()}
        required
        disabled
      />,
    );
    const input = screen.getByLabelText('Secret');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'new-password');
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });
});
