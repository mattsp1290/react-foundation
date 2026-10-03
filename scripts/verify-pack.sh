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
echo "packed install ok"
