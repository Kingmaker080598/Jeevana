import "@testing-library/jest-dom/vitest";

const storedValues = new Map<string, string>();

const memoryStorage: Storage = {
  get length() {
    return storedValues.size;
  },
  clear() {
    storedValues.clear();
  },
  getItem(key) {
    return storedValues.get(key) ?? null;
  },
  key(index) {
    return [...storedValues.keys()][index] ?? null;
  },
  removeItem(key) {
    storedValues.delete(key);
  },
  setItem(key, value) {
    storedValues.set(key, value);
  },
};

// Node 25 exposes an incomplete experimental localStorage unless a backing file
// is configured. Tests use a deterministic in-memory Web Storage implementation.
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: memoryStorage,
});
