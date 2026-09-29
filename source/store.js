// App state, plus an in-memory ticket store with the same interface as firestore-store.js
// ({ subscribe, add, update }). Demo mode and the tests run on it; nothing touches Firestore.

export function createState(initial) {
  let state = initial;
  const subs = new Set();
  return {
    get: () => state,
    set(patch) {
      state = { ...state, ...patch };
      subs.forEach((fn) => fn(state));
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

export function memoryStore(now = () => new Date()) {
  let reports = [];
  const subs = new Set();
  const snapshot = () => reports.map((r) => ({ ...r }));
  const emit = () => subs.forEach((fn) => fn(snapshot()));
  return {
    subscribe(fn) {
      subs.add(fn);
      fn(snapshot());
      return () => subs.delete(fn);
    },
    async add(report) {
      const id = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
      reports = [...reports, { ...report, id, reportedAt: now(), updatedAt: now() }];
      emit();
      return id;
    },
    async update(id, patch) {
      reports = reports.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: now() } : r));
      emit();
    },
  };
}
