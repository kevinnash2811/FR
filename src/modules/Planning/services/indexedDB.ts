let db!: IDBDatabase;

const DBOpenRequest = window.indexedDB.open("planning", 3);

DBOpenRequest.onerror = (err) => {
  console.warn(`Error loading database. ${DBOpenRequest.error}`, err);
};

DBOpenRequest.onsuccess = () => { db = DBOpenRequest.result; };
DBOpenRequest.onupgradeneeded = () => {
  console.log("Database initialized.");
  const db = DBOpenRequest.result;
  const planningStore = db.createObjectStore("planning", { keyPath: "id" });

  planningStore.createIndex("name", "name", { unique: true });
};
