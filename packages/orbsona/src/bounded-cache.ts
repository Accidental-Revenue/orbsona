export class BoundedCache<Key, Value> {
  readonly #limit: number;
  readonly #entries = new Map<Key, Value>();

  constructor(limit: number) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new TypeError("BoundedCache limit must be a positive integer.");
    }
    this.#limit = limit;
  }

  get size() {
    return this.#entries.size;
  }

  get(key: Key): Value | undefined {
    const value = this.#entries.get(key);
    if (value === undefined) return undefined;
    this.#entries.delete(key);
    this.#entries.set(key, value);
    return value;
  }

  set(key: Key, value: Value) {
    this.#entries.delete(key);
    if (this.#entries.size >= this.#limit) {
      const oldest = this.#entries.keys().next();
      if (!oldest.done) this.#entries.delete(oldest.value);
    }
    this.#entries.set(key, value);
  }
}
