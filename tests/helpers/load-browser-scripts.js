const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createBrowserContext(overrides = {}) {
  const values = new Map();
  const context = {
    console,
    Date,
    Math,
    Promise,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    localStorage: {
      getItem(key) {
        return values.has(key) ? values.get(key) : null;
      },
      setItem(key, value) {
        values.set(key, String(value));
      },
      removeItem(key) {
        values.delete(key);
      }
    },
    fetch: async () => ({ ok: false }),
    addEventListener() {},
    ...overrides
  };
  context.window = context;
  vm.createContext(context);
  return context;
}

function loadBrowserScripts(context, ...scriptPaths) {
  for (const scriptPath of scriptPaths) {
    const absolutePath = path.resolve(__dirname, '..', '..', scriptPath);
    const source = fs.readFileSync(absolutePath, 'utf8');
    vm.runInContext(source, context, { filename: absolutePath });
  }
  return context;
}

module.exports = { createBrowserContext, loadBrowserScripts };