
type cacheObject = {
    key: string,
    value: string|null,
    expires_at: number,
};

export default class Cache {

    // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
    private db: IDBDatabase;

    private static readonly indexedDbName = 'cache_db';
    private static readonly objectStoreName = 'cache_store';

    constructor() {

    }

    initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            const dbRequest = window.indexedDB.open(Cache.indexedDbName, 1);

            dbRequest.onerror = (event) => {
                reject(event);
            };

            dbRequest.onblocked = (event) => {
                reject(event);
            };

            dbRequest.onupgradeneeded = (event) => {
                // @ts-ignore
                const db: IDBDatabase = event.target.result;

                const objectStore = db.createObjectStore(Cache.objectStoreName, { keyPath: 'key'});
                objectStore.createIndex('expires_at', 'expires_at', { unique: false });

                // objectStore.transaction.oncomplete = (event) => {};
            };

            dbRequest.onsuccess = (event) => {
                this.db = dbRequest.result;

                resolve();
            };
        });
    }

    private getObjectStore(mode: IDBTransactionMode): IDBObjectStore {
        return this.db.transaction([Cache.objectStoreName], mode).objectStore(Cache.objectStoreName);
    }

    get(key: string, def: any = null): Promise<any> {
        return new Promise((resolve, reject) => {
            const request = this.getObjectStore('readonly').get(key);

            request.onsuccess = (event) => {
                const obj: cacheObject = request.result;

                if(obj === undefined || obj === null || obj.expires_at < +(new Date())) {
                    resolve(def);
                } else {
                    resolve(obj.value);
                }
            };

            request.onerror = (event) => {
                reject();
            };
        });
    }

    set(key: string, value: string, ttl: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const obj: cacheObject = {
                key: key,
                value: value,
                expires_at: +(new Date()) + ttl,
            }

            const request = this.getObjectStore('readwrite').put(obj);
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
        });
    }

    delete(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = this.getObjectStore('readwrite').delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
        });
    }

    clear(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = this.getObjectStore('readwrite').clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
        });
    }

    close(): void {
        this.db.close();
    }

    static drop(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.deleteDatabase(Cache.indexedDbName);
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
        });
    }

    clean(): Promise<void> {
        return new Promise((resolve, reject) => {
            const cacheObjectStore = this.getObjectStore('readwrite');

            const cursorRequest = cacheObjectStore
                .index('expires_at')
                .openKeyCursor(IDBKeyRange.upperBound(+new Date(), true));

            cursorRequest.onsuccess = (event) => {
                // @ts-ignore
                const cursor: IDBCursor = event.target.result;
                if(cursor) {
                    const request = cacheObjectStore.delete(cursor.primaryKey);
                    request.onsuccess = () => cursor.continue();
                    request.onerror = () => reject();
                } else {
                    resolve();
                }
            };

            cursorRequest.onerror = () => reject();
        });
    }

    hasGet(key: string): Promise<[boolean, string]> {
        return this.get(key, this).then((value) => {
            if(value !== this) {
                return [true, value];
            } else {
                return [false, undefined];
            }
        });
    }

    fetch(key: string, callback: () => Promise<string>, ttl: number = 24 * 60 * 60 * 1000): Promise<string> {
        return this.hasGet(key).then(([has, value]) => {
            if(has) {
                return value;
            }

            return callback().then((value) => {
                return this.set(key, value, ttl).then(() => {
                    return value;
                });
            });
        });
    }
}
