/** @type {import('tailwindcss').Config} */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build']);
const TARGET_DIRS = new Set(['components', 'pages', 'services']);
const TARGET_TOP_LEVEL = new Set(['App.tsx', 'index.tsx', 'constants.tsx', 'types.ts', 'index.css']);
const TARGET_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

function collectFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }

    if (TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

const content = [path.join(ROOT, 'index.html')];

for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (entry.isFile() && TARGET_TOP_LEVEL.has(entry.name)) {
    content.push(path.join(ROOT, entry.name));
  }

  if (entry.isDirectory() && TARGET_DIRS.has(entry.name)) {
    content.push(...collectFiles(path.join(ROOT, entry.name)));
  }
}

module.exports = {
  content,
  theme: {
    extend: {
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
