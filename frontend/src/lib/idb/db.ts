import { openDB } from 'idb';

// IndexedDB adatbázis létrehozása és kezelése
// 'recept-ajánló' adatbázis névvel, 3 objektumtárolóval:
// 'pantry' - meglévő hozzávalók
// 'cart' - bevásárlólista
// 'preferences' - intoleranciák/allergiák
export const dbPromise = openDB('recept-ajánló', 1, {
    upgrade(db) {
        db.createObjectStore('pantry', { keyPath: 'id' });        // meglévő hozzávalók
        db.createObjectStore('cart', { keyPath: 'id' });          // bevásárlólista
        db.createObjectStore('preferences');                      // intoleranciák/allergiák
    }
});

export const idb = {
    async get(store: string, key: IDBValidKey) {
        return (await dbPromise).get(store, key);
    },
    async put(store: string, value: any) {
        return (await dbPromise).put(store, value);
    },
    async getAll(store: string) {
        return (await dbPromise).getAll(store);
    },
    async del(store: string, key: IDBValidKey) {
        return (await dbPromise).delete(store, key);
    }
};