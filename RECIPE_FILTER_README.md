# Recept Szűrés és Keresés Funkció - Használati Útmutató

## Áttekintés

Ez a funkció lehetővé teszi a felhasználók számára, hogy:
1. **Keressenek** receptekben név és leírás alapján
2. **Szűrjenek** az általuk megadott étkezési preferenciák szerint (vegetáriánus, vegán, stb.)
3. **Kiszűrjék** azokat a recepteket, amelyek allergiákat tartalmaznak (glutén, laktóz, rákfélék, stb.)

## Telepítés és Adatbázis Migráció

### 1. Backend Beállítás

Futtasd le az új migrációkat az adatbázison:

```bash
cd backend
alembic upgrade head
```

Ez létrehozza a szükséges mezőket a receptekben (`dietary_tags` és `allergens`), valamint feltölti a meglévő recepteket példa adatokkal.

### 2. Használat

#### Backend API Végpont

**GET** `/api/v1/recipes/search`

Query paraméterek:
- `search_query` (opcionális): Keresési szöveg
- `use_user_profile` (boolean, alapértelmezett: false): Felhasználói profil szerinti szűrés
- `limit` (opcionális, alapértelmezett: 20): Találatok száma
- `offset` (opcionális, alapértelmezett: 0): Lapozáshoz

Példa használat:
```
GET /api/v1/recipes/search?search_query=pizza&use_user_profile=true
```

#### Frontend Használat

1. **Navigálj** a `/search-recipes` oldalra a navigációs menü "Search" gombjával
2. **Írj be keresési szöveget** a receptek neveiben vagy leírásában való kereséshez
3. **Kapcsold be a "Szűrés profilom alapján" opciót** a profilodban beállított preferenciák és érzékenységek szerinti szűréshez
4. A találatok automatikusan megjelennek

### 3. Példa Adatok

A migráció automatikusan címkézi a recepteket név alapján:

**Étkezési címkék (dietary_tags):**
- `vegetarian` - Vegetáriánus
- `vegan` - Vegán
- `gluten-free` - Gluténmentes
- `lactose-free` - Laktózmentes
- `pescatarian` - Peszketáriánus

**Allergének (allergens):**
- `gluten` - Glutén
- `lactose` - Laktóz
- `fish` - Hal
- `shellfish` - Rákfélék
- `egg` - Tojás
- `tree-nut` - Diófélék
- `peanut` - Földimogyoró
- `soy` - Szója
- `sesame` - Szezám

### 4. Receptek Manuális Frissítése

Ha új receptet adsz hozzá vagy módosítani szeretnéd a meglévőket, használd ezt a struktúrát:

```python
recipe = Recipe(
    name="Vegán Lasagne",
    description="...",
    dietary_tags=["vegan", "vegetarian", "lactose-free"],
    allergens=["gluten", "soy"]
)
```

## Működési Logika

### Szűrési Szabályok

1. **Érzékenységek (allergiák)**: Ha a felhasználó érzékeny valamire (pl. rákfélékre), akkor azok a receptek **kiszűrődnek**, amelyek tartalmazzák azt az allergént.

2. **Preferenciák**: Ha a felhasználónak vannak preferenciái (pl. vegetáriánus), akkor **csak** azok a receptek jelennek meg, amelyek tartalmaznak legalább egy megfelelő címkét.

3. **Keresés**: A keresési szöveg a receptek nevében és leírásában keres (kis/nagybetű független).

### Példa Felhasználói Profil

**Felhasználó beállításai:**
- Preferenciák: vegetáriánus, gluténmentes
- Érzékenységek: laktóz

**Eredmény:**
- ✅ Megjelenik: Vegán curry (vegetáriánus, gluténmentes, laktózmentes)
- ✅ Megjelenik: Zöldséges rizottó (vegetáriánus, gluténmentes, de laktóz - kiszűrésre kerül ha tartalmaz)
- ❌ Nem jelenik meg: Csirkemell sajtos krumplival (nem vegetáriánus)
- ❌ Nem jelenik meg: Vegetáriánus pizza (vegetáriánus, de tartalmaz glutént és laktózt)

## Technikai Részletek

### Backend
- SQLAlchemy JSON mezők használata a rugalmas adatstruktúrához
- PostgreSQL JSONB operátorok (`jsonb_contains`) a hatékony szűréshez
- FastAPI végpont JWT autentikációval

### Frontend
- React komponensek TypeScript-tel
- Valós idejű szűrés
- Responsive design Tailwind CSS-sel

## További Fejlesztési Lehetőségek

1. **Admin felület** receptek dietary_tags és allergens értékeinek szerkesztéséhez
2. **Automatikus detektálás** hozzávalók alapján
3. **Több szűrési opció** (kalória, elkészítési idő, stb.)
4. **Mentett keresések** a felhasználók számára
