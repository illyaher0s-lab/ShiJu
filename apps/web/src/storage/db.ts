const databaseName = "ai-reading-trainer";
const databaseVersion = 1;

const objectStores = [
  "segments",
  "candidateExpressions",
  "expressionSenses",
  "occurrences",
  "clientOperations",
] as const;

export type ObjectStoreName = (typeof objectStores)[number];

export function openAppDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in globalThis)) {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }

    const request = indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => {
      const database = request.result;
      for (const storeName of objectStores) {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, { keyPath: storeName === "clientOperations" ? "clientOperationId" : "id" });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addRecord(storeName: ObjectStoreName, record: unknown): Promise<void> {
  const database = await openAppDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  database.close();
}
