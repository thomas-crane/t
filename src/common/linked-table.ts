
export interface LinkedTable<K, V> {
  /**
   * The parent of this table, or undefined
   * if this table has no parent.
   */
  parent: LinkedTable<K, V> | undefined;
  /**
   * Find the item with the given `key` in the
   * current table or any parent tables.
   */
  get(key: K): V | undefined;
  /**
   * Find the item with the given `key`
   * in the current table only.
   */
  getImmediate(key: K): V | undefined;
  /**
   * Adds the `value` to the current table
   * using the given `key`.
   */
  set(key: K, value: V): void;

  /**
   * The entries in this table.
   */
  entries(): IterableIterator<[K, V]>;
}

export function createLinkedTable<K, V>(parent?: LinkedTable<K, V>): LinkedTable<K, V> {
  const table = new Map<K, V>();
  return {
    parent,
    get(key) {
      if (table.has(key)) {
        return table.get(key);
      }
      if (this.parent !== undefined) {
        return this.parent.get(key);
      }
      return undefined;
    },

    getImmediate(key) {
      return table.get(key);
    },

    set(key, value) {
      table.set(key, value);
    },
    entries() {
      return table.entries();
    },
  };
}
