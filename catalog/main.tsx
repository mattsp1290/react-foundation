import {
  AppShell,
  applyTheme,
  ErrorMessage,
  isThemeMode,
  LoginForm,
  Panel,
  RegisterForm,
  StatusMessage,
  TextField,
} from '@birb/react-foundation';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@birb/react-foundation/tokens.css';
import '@birb/react-foundation/base.css';

// ?theme=light|dark|system selects the mode; ?login=idle|pending|error selects
// the LoginForm state. The form ids are fixed, so each form appears once.
const query = new URLSearchParams(window.location.search);
const theme = query.get('theme');
const login = query.get('login') ?? 'idle';
applyTheme(isThemeMode(theme) ? theme : 'system');

function Catalog() {
  const [nest, setNest] = useState('');
  const [submitted, setSubmitted] = useState<string>();
  return (
    <AppShell
      titleLink={<a href="./">react-foundation catalog</a>}
      footer={
        <>
          Theme: <code>{document.documentElement.dataset.theme}</code>
        </>
      }
    >
      <Panel heading="Log in" headingId="login-heading">
        <LoginForm
          initialUsername="bird"
          pending={login === 'pending'}
          error={login === 'error'}
          onSubmit={(username) => setSubmitted(`login ${username}`)}
        />
      </Panel>
      <Panel heading="Register" headingId="register-heading">
        <RegisterForm
          pending={false}
          onSubmit={(username) => setSubmitted(`register ${username}`)}
        />
      </Panel>
      <Panel heading="Account" headingId="account-heading">
        <p>
          Signed in as <strong>bird</strong>.
        </p>
        <nav className="inline-nav" aria-label="Account navigation">
          <a href="#settings">Settings</a>
          <a href="#videos">My videos</a>
          <a href="#library">Library</a>
        </nav>
        <button type="button">Log out</button>
      </Panel>
      <Panel heading="Fields and messages" headingId="fields-heading">
        <form onSubmit={(event) => event.preventDefault()}>
          <TextField
            id="nest"
            label="Nest name"
            value={nest}
            onChange={setNest}
            description="Shown to other birds."
          />
        </form>
        <StatusMessage>{submitted ?? 'Preferences saved.'}</StatusMessage>
        <ErrorMessage>Preferences could not be loaded.</ErrorMessage>
        <ErrorMessage live={false}>
          Failure reason: unsupported codec
        </ErrorMessage>
      </Panel>
      <Panel heading="Buttons" headingId="buttons-heading">
        <button type="button">Enabled</button>{' '}
        <button type="button" disabled>
          Disabled
        </button>
      </Panel>
      <Panel heading="Choices" headingId="choices-heading">
        <fieldset>
          <legend>Appearance</legend>
          <p>System follows your device’s color preference.</p>
          {['System', 'Light', 'Dark'].map((mode) => (
            <label key={mode}>
              <input
                type="radio"
                name="appearance"
                defaultChecked={mode === 'System'}
              />{' '}
              {mode}
            </label>
          ))}
        </fieldset>
      </Panel>
    </AppShell>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Catalog />
  </StrictMode>,
);
