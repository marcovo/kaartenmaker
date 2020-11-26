
type cacheObject = {
    key: string,
    value: string|null,
    expires_at: number,
};

export default class Cache {

    // https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
    private db: IDBDatabase;

    constructor(private readonly cache_name: string) {

    }

    initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            const dbRequest = window.indexedDB.open('kaartenmaker', 1);

            dbRequest.onerror = (event) => {
                reject(event);
            };

            dbRequest.onblocked = (event) => {
                reject(event);
            };

            dbRequest.onupgradeneeded = (event) => {
                // @ts-ignore
                const db = event.target.result;

                const objectStore = db.createObjectStore(this.cache_name, { keyPath: 'key'});
                objectStore.createIndex('expires_at', 'expires_at', { unique: false });

                // objectStore.transaction.oncomplete = (event) => {};
            };

            dbRequest.onsuccess = (event) => {
                this.db = dbRequest.result;

                resolve();
            };
        });
    }

    get(key: string, def: any = null): Promise<any> {
        return new Promise((resolve, reject) => {
            const cacheObjectStore = this.db.transaction([this.cache_name], 'readonly').objectStore(this.cache_name);

            const request = cacheObjectStore.get(key);

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
            const cacheObjectStore = this.db.transaction([this.cache_name], 'readwrite').objectStore(this.cache_name);

            const obj: cacheObject = {
                key: key,
                value: value,
                expires_at: +(new Date()) + ttl,
            }

            const request = cacheObjectStore.put(obj);
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
        });
    }

    delete(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const cacheObjectStore = this.db.transaction([this.cache_name], 'readwrite').objectStore(this.cache_name);

            const request = cacheObjectStore.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
        });
    }

    clear(): Promise<void> {
        return new Promise((resolve, reject) => {
            const cacheObjectStore = this.db.transaction([this.cache_name], 'readwrite').objectStore(this.cache_name);

            const request = cacheObjectStore.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject();
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
