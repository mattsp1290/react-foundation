#!/bin/sh
# Packed-install smoke test: the tarball must hold the built entry and the CSS,
# leak no source, and import under plain Node ESM from an empty project.
set -eu
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
tarball=$tmp/$(npm pack --silent --pack-destination "$tmp")
for path in dist/index.js dist/index.d.ts css/tokens.css css/base.css; do
  tar tzf "$tarball" | grep -qx "package/$path" || {
    echo "missing $path"
    exit 1
  }
done
if tar tzf "$tarball" | grep -Eq '^package/(src|catalog|e2e|scripts)/|\.test\.'; then
  echo "tarball leaks source or test files"
  exit 1
fi
mkdir "$tmp/consumer"
cd "$tmp/consumer"
npm init -y >/dev/null
npm install --no-audit --no-fund react@19 react-dom@19 "$tarball" >/dev/null
node --input-type=module -e "import('@birb/react-foundation').then(m => { if (typeof m.applyTheme !== 'function') throw new Error('entry missing applyTheme'); })"
# Every exports target, including the types and the CSS subpaths, must exist.
node --input-type=module -e "
import { existsSync, readFileSync } from 'node:fs';
const root = 'node_modules/@birb/react-foundation/';
const { exports } = JSON.parse(readFileSync(root + 'package.json', 'utf8'));
const targets = Object.values(exports).flatMap((t) => typeof t === 'string' ? [t] : Object.values(t));
if (targets.length < 4) throw new Error('unexpected exports map');
for (const target of targets) if (!existsSync(root + target)) throw new Error('exports target missing: ' + target);
"
echo "packed install ok"
