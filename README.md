# Projekt Labor - 2025-26/1
## Inteligens Recept ajánló és bevásárló lista alkalmazás

A projekt célja egy olyan alkalmazás fejlesztése, amely recept ajánlást és bevásárló lista generálást kínál a felhasználók számára.  
Az alkalmazás lehetővé teszi a felhasználók számára, hogy személyre szabott recepteket kapjanak az általuk megadott preferenciák és diétás igények alapján, valamint automatikusan létrehozza a szükséges bevásárló listát a kiválasztott receptekhez.

---

### Főbb funkciók

#### 1. Recept ajánlás
- Felhasználói profil létrehozása (diéta, allergiák, kedvenc ételek stb.)
- Személyre szabott recept ajánlások generálása
- Keresési funkció különböző szűrőkkel (pl. összetevők, elkészítési idő, nehézségi szint)

#### 2. Bevásárló lista generálás
- Kiválasztott receptek alapján automatikus bevásárló lista

---

### Backend technológiák
- Python
- FastAPI
- Uvicorn
- Adatbázis: MySQL

---

### Frontend technológiák
- HTML, CSS, JavaScript
- React.js
- PWA

---

## Backend telepítési útmutató

### 1. Környezet beállítása
Győződj meg róla, hogy **Python 3.13** és **MySQL** telepítve van a rendszereden.

Hozz létre egy virtuális környezetet a projekt számára:
```bash
python -m venv venv
```


Aktiváld a virtuális környezetet:

Windows:
```bash
.\venv\Scripts\activate
```

macOS/Linux:
```bash
source venv/bin/activate
```
2. Szükséges csomagok telepítése:
    - Telepítsd a szükséges Python csomagokat a `requirements.txt`
        fájl alapján:
        ```bash
        pip install -r requirements.txt
        ```
3. Adatbázis beállítása:
    - Hozz létre egy új MySQL adatbázist a projekt számára.
    - Frissítsd a `.env` fájlt a megfelelő adatbázis
        kapcsolati adatokkal (pl. felhasználónév, jelszó, adatbázis név).
4. Adatbázis migrációk futtatása:
    - Futtasd a migrációs parancsokat az adatbázis szerkezetének létrehozásához:
        ```bash
        alembic upgrade head
        ```
5. Alkalmazás indítása:
    - Indítsd el a FastAPI alkalmazást Uvicorn szerverrel:
        ```bash
        cd backend
        uvicorn app.main:app --reload
        ```
    - Az alkalmazás most elérhető a `http://127.0.0.1:8000` címen.


6. Frontend alkalmazás indítása(új terminál ablakban):
        ```bash
        cd frontend
        npm install
        npm start
        ```
   - Az alkalmazás most elérhető a `http://localhost:3000` címen.


7. API dokumentáció:
    - Az automatikusan generált API dokumentáció elérhető a következő URL-en
        - Swagger UI: `http://127.0.0.1:8000/api/docs`

       
        