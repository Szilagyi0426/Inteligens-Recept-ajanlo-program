
# Intelligens Receptajánló és Bevásárlólista Alkalmazás — TODO

## Kristóf
- Backend
  - [x] Backend alap legenerálása
  - [x] Regisztrációhoz, bejelentkezéshez tartozó API végpontok
  - [x] Személyes adatok lekérdezése API végpontok
  - [x] Érzékenységek hozzáadása és eltávolítása API végpontok
  - [ ] recept kedvencekhez adás, és kiválasztott receptek API végpontok

- Frontend
  - [x] Frontend alap legenerálása
  - [x] Regisztrációs / Bejelentkezési felület legenerálása
  - [x] Profile oldal elkészítése
  - [ ] Main oldal elkészítése
  - [ ] Elefelejtett jelszó 

## Balázs
- Backend
  - [ ] 
- Frontend
  - [ ] Recipes oldal elészítése, egyenlőre nem preferencia szűrt receptek
    - [ ] kedvenezkhez adás gomb ( * )
    - [ ] recept kiváalsztása gomb ( + )
    - [ ] register-profile-setup oldal teljesnév + telefonszám bekérése

## Lóránt
- Backend
  - [ ] recipeID alapján lekérés, minden hozzátartozó információval
  - [ ] 
- Frontend
  - [ ]




## 1. Szakirodalmi áttekintés
- [x] Gyűjts szakirodalmat az intelligens receptajánlók témakörében  
- [ ] Kutatás a PWA technológiák előnyeiről és követelményeiről  
- [ ] Ismerd meg a táplálkozási preferenciák és allergiák adatkezelésének modellezését  

##  2. Rendszerterv és architektúra
- [x] Készíts architekturális tervet (frontend, backend, adatbázis)  
- [x] Tervezd meg az adatbázis sémát:
  - Felhasználók  
  - Receptek  
  - Hozzávalók  
  - Preferenciák és érzékenységek  

## 3. Backend fejlesztés (FastAPI + MySQL)
- [x] FastAPI projekt alap létrehozása  
- [x] Adatbázis modellek és sémák implementálása (SQLAlchemy)  
- [x] Felhasználói autentikáció (JWT)  
- [ ] Recept, hozzávaló, preferencia CRUD műveletek  
- [ ] Ajánlórendszer API (preferenciák és készlet alapján)  
- [ ] Tesztelés (pytest)  

## 4. Frontend fejlesztés (Next.js + React)
- [x] Projektstruktúra felépítése (ui, data, model, util)  
- [x] Felhasználói bejelentkezés / regisztráció felület  
- [x] Profil oldal (preferenciák, érzékenységek kezelése)  
- [ ] Receptlista + részletes nézet  
- [ ] Bevásárlólista generálás  
- [ ] Toast értesítések integrálása siker/hiba esetén  

## 5. PWA funkciók
- [ ] Offline működés biztosítása  
- [ ] Telepíthetőség beállítása (manifest.json, service worker)  
- [ ] Reszponzív design kialakítása  

## 6. Biztonság és adatvédelem
- [x] Felhasználói adatok biztonságos tárolása (hashed jelszavak)  
- [ ] Input validálás és hibakezelés  
- [ ] HTTPS és CORS beállítások  

## 7. Tesztelés és értékelés
- [ ] Funkcionális tesztek (API, UI)  
- [ ] Teljesítménytesztek  
- [ ] Felhasználói visszajelzések gyűjtése  

## 8. Dokumentáció
- [ ] Projekt dokumentáció (rendszerleírás, használati útmutató)  
- [ ] Képernyőképek és működési példák  
- [ ] Végső jelentés (Projektlabor leadáshoz)