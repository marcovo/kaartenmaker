
type cacheObject = {
    value: string|null,
    expires: number,
};

export default class Cache {

    constructor(private readonly prefix: string) {

    }

    get(key: string, def: any = null): any {
        const objString = window.localStorage.getItem(this.prefix + key);

        if(objString === null) {
            return def;
        }

        const obj: cacheObject = JSON.parse(objString);

        if(obj.expires < +(new Date())) {
            return def;
        }

        return obj.value;
    }

    set(key: string, value: string, ttl: number): void {
        const obj: cacheObject = {
            value: value,
            expires: +(new Date()) + ttl,
        }
        window.localStorage.setItem(this.prefix + key, JSON.stringify(obj))
    }

    delete(key: string): void {
        window.localStorage.removeItem(this.prefix + key);
    }

    clear(): void {
        for(let i=window.localStorage.length-1; i>=0; i--) {
            const storageKey = window.localStorage.key(i);
            if(storageKey === null) {
                throw new Error('Cache element not found');
            }

            if(storageKey.substr(0, this.prefix.length) === this.prefix) {
                window.localStorage.removeItem(storageKey);
            }
        }
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    fetchPromise(key: string, callback: () => Promise<string>, ttl: number = 24 * 60 * 60 * 1000): Promise<string> {
        return new Promise((resolve, reject) => {
            const value = this.get(key, this);
            if(value !== this) {
                return resolve(value);
            }

            return callback().then((value) => {
                this.set(key, value, ttl);

                resolve(value);
            });
        });
    }
}
