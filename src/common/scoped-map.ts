export interface ScopedMap<K, V> {
  /**
   * Adds another scope level to this scoped map.
   */
  pushScope(): void;
  /**
   * Removes a scope level from this scoped map.
   * Throws an error if this would remove the root
   * scope.
   */
  popScope(): void;
  /**
   * Find the item with the given `key` in the
   * current scope or any parent scopes.
   */
  get(key: K): V | undefined;
  /**
   * Find the item with the given `key`
   * in the current scope only.
   */
  getImmediate(key: K): V | undefined;
  /**
   * Adds the `value` to the current scope
   * using the given `key`.
   */
  set(key: K, value: V): void;
}

/**
 * Creates a new `ScopedMap` instance.
 */
export function createScopedMap<K, V>(): ScopedMap<K, V> {
  const maps: Array<Map<K, V>> = [
    new Map(),
  ];

  return {
    pushScope() {
      maps.unshift(new Map());
    },

    popScope() {
      if (maps.length > 1) {
        maps.shift();
      } else {
        throw new Error('Cannot pop the root scope of a ScopedMap.');
      }
    },

    get(key) {
      for (const map of maps) {
        if (map.has(key)) {
          return map.get(key);
        }
      }
      return undefined;
    },

    getImmediate(key) {
      return maps[0].get(key);
    },

    set(key, value) {
      maps[0].set(key, value);
    },
  };
}
