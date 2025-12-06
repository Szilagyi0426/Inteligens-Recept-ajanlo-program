# Recept Szűrés és Keresés - Implementáció Összefoglaló

## Megvalósított Funkciók

### 1. Backend Változtatások

#### Adatbázis Modellek
- **Recipe model** (backend/app/models/recipe.py):
  - Új mezők: `dietary_tags` (JSON) - étkezési preferenciák címkéi
  - Új mezők: `allergens` (JSON) - allergén anyagok listája

#### Migrációk
- **0003_add_recipe_dietary_info.py**: Új mezők hozzáadása a recipes táblához
- **0004_seed_recipe_dietary_data.py**: Meglévő receptek automatikus címkézése név alapján

#### API Végpontok
- **GET /api/v1/recipes/search**: Új keresési végpont
  - Paraméterek:
    - `search_query`: Keresési szöveg (név, leírás)
    - `use_user_profile`: Boolean - profil alapú szűrés
    - `limit`: Találatok száma (alapértelmezett: 20)
    - `offset`: Lapozás (alapértelmezett: 0)
  
  - Funkciók:
    - Szöveges keresés receptek nevében és leírásában
    - Kiszűri az allergiás anyagokat tartalmazó recepteket
    - Szűr étkezési preferenciák szerint
    - Visszaadja a kedvenc és kiválasztott státuszokat

#### Schemák
- **RecipeBase és RecipeOut**: Frissítve `dietary_tags` és `allergens` mezőkkel

### 2. Frontend Változtatások

#### Új Komponensek

**RecipeFilter.tsx** (frontend/src/components/RecipeFilter.tsx)
- Keresési mező név/leírás alapján
- Profil alapú szűrés checkbox
- Aktív szűrők megjelenítése
- Szűrők törlése funkció

**RecipeCard.tsx** (frontend/src/components/RecipeCard.tsx)
- Recept kártya megjelenítés
- Dietary tags megjelenítése (zöld címkék)
- Allergens megjelenítése (narancssárga címkék)
- Kedvenc és kiválasztás gombok
- Meta információk (idő, adag, értékelés)

**SearchRecipesPage** (frontend/src/app/search-recipes/page.tsx)
- Teljes oldal a receptek kereséséhez
- Integrálja a RecipeFilter és RecipeCard komponenseket
- Autentikációt igényel (RequireAuth)

#### API Kliens

**recipe.ts** (frontend/src/lib/api/recipe.ts)
- `searchRecipes()`: Keresési API hívás
- `getAllRecipes()`: Összes recept lekérése
- `getRecipesList()`: Rövid lista lekérése
- `getRecipeDetails()`: Recept részletek
- `toggleFavorite()`: Kedvenc állapot változtatása
- `toggleSelected()`: Kiválasztás változtatása

#### Navigáció
- **Navbar.tsx**: Új "Search" gomb hozzáadva a menühöz

### 3. Címkék és Kategóriák

#### Étkezési Preferenciák (Dietary Tags)
- `vegetarian` - Vegetáriánus
- `vegan` - Vegán
- `gluten-free` - Gluténmentes
- `lactose-free` - Laktózmentes
- `pescatarian` - Peszketáriánus
- `low-carb` - Alacsony szénhidráttartalmú
- `halal` - Halal
- `kosher` - Kóser

#### Allergének
- `gluten` - Glutén
- `lactose` - Laktóz
- `fish` - Hal
- `shellfish` - Rákfélék
- `egg` - Tojás
- `tree-nut` - Diófélék
- `peanut` - Földimogyoró
- `soy` - Szója
- `sesame` - Szezám

## Használati Útmutató

### Telepítés

1. **Backend migráció futtatása:**
```bash
cd backend
alembic upgrade head
```

2. **Frontend használata:**
- Navigálj a `/search-recipes` oldalra
- Használd a keresőmezőt vagy kapcsold be a profil alapú szűrést

### Példa Használati Esetek

#### 1. Egyszerű Keresés
```
Keresési szöveg: "pizza"
Profil szűrés: KI
→ Minden pizza receptet megjelenít
```

#### 2. Profil Alapú Szűrés
```
Felhasználó beállításai:
- Preferenciák: vegetáriánus, gluténmentes
- Érzékenységek: laktóz

Keresési szöveg: -
Profil szűrés: BE
→ Csak vegetáriánus ÉS gluténmentes receptek
→ Kiszűri a laktózt tartalmazó recepteket
```

#### 3. Kombinált Keresés
```
Keresési szöveg: "saláta"
Profil szűrés: BE
→ Saláta receptek, amelyek megfelelnek a profilnak
```

## Technikai Részletek

### Adatbázis Kompatibilitás
- JSON mezők használata (SQLAlchemy JSON type)
- LIKE operátor használata JSON stringben való kereséshez
- Kompatibilis PostgreSQL, MySQL, SQLite adatbázisokkal

### Szűrési Logika

**Érzékenységek (Allergiák):**
```python
# Kiszűri a recepteket, ha tartalmaznak allergént
Recipe.allergens NOT LIKE '%"allergen_name"%'
```

**Preferenciák:**
```python
# Csak azok a receptek, amelyek tartalmaznak legalább egy preferenciát
Recipe.dietary_tags LIKE '%"preference_name"%'
```

### Frontend State Management
- Local state használata React hooks-szal
- Optimista UI frissítések kedvenc/kiválasztás műveleteknél
- Error handling toast értesítésekkel

## Továbbfejlesztési Lehetőségek

1. **Admin Felület**: Receptek dietary_tags és allergens szerkesztése
2. **Automatikus Detektálás**: Hozzávalók alapján automatikus címkézés
3. **Mentett Keresések**: Felhasználók menthetik kedvenc kereséseiket
4. **Fejlett Szűrők**: Kalória, makrók, elkészítési idő
5. **Ajánló Rendszer**: Gépi tanulás alapú receptajánlás profil alapján
6. **Batch Import**: CSV/Excel fájlból receptek importálása címkékkel

## Tesztelés

### Backend Tesztek
```bash
# API endpoint tesztelése
curl -X GET "http://localhost:8000/api/v1/recipes/search?use_user_profile=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Tesztek
1. Navigálj `/search-recipes`
2. Próbáld ki a keresést különböző szavakkal
3. Kapcsold be/ki a profil szűrést
4. Ellenőrizd a címkéket a recepteken

## Fájlok Listája

### Backend
- `backend/app/models/recipe.py` - Módosítva
- `backend/app/schemas/recipe.py` - Módosítva
- `backend/app/api/v1/endpoints/recipe.py` - Módosítva
- `backend/migrations/versions/0003_add_recipe_dietary_info.py` - Új
- `backend/migrations/versions/0004_seed_recipe_dietary_data.py` - Új

### Frontend
- `frontend/src/lib/api/recipe.ts` - Új
- `frontend/src/components/RecipeFilter.tsx` - Új
- `frontend/src/components/RecipeCard.tsx` - Új
- `frontend/src/app/search-recipes/page.tsx` - Új
- `frontend/src/components/layout/Navbar.tsx` - Módosítva

## Licensz és Dokumentáció
- Részletes használati útmutató: `RECIPE_FILTER_README.md`
- Implementáció összefoglaló: `RECIPE_FILTER_IMPLEMENTATION.md` (ez a fájl)
