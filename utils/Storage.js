/** Safe storage for embeds — localStorage with in-memory fallback */

const memory = new Map();

function canUseLocalStorage() {
  try {
    const key = '__qm_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const useLS = canUseLocalStorage();

export const Storage = {
  getItem(key) {
    if (useLS) {
      try {
        return localStorage.getItem(key);
      } catch {
        return memory.has(key) ? memory.get(key) : null;
      }
    }
    return memory.has(key) ? memory.get(key) : null;
  },

  setItem(key, value) {
    if (useLS) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        /* fall through */
      }
    }
    memory.set(key, value);
  },

  removeItem(key) {
    if (useLS) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
    memory.delete(key);
  },

  hasKey(key) {
    if (useLS) {
      try {
        return localStorage.getItem(key) !== null;
      } catch {
        return memory.has(key);
      }
    }
    return memory.has(key);
  },
};
