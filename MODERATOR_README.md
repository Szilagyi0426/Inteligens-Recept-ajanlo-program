# Moderátor Interfész

## Áttekintés

A moderátor interfész lehetővé teszi a felhasználók kezelését és moderálását az alkalmazásban. Csak moderátor (role_id=1) és admin (role_id=2) jogosultságú felhasználók férhetnek hozzá.

## Funkciók

### 1. Felhasználók listázása
- Összes felhasználó megjelenítése táblázatos formában
- Keresés felhasználónév, email vagy teljes név alapján
- Szűrés szerepkör szerint (User, Moderator, Admin)
- Statisztikák: összes felhasználó, moderátorok, adminok száma

### 2. Felhasználó részletek
- Alapadatok megtekintése (név, email, telefon, létrehozás dátuma)
- Étkezési preferenciák listája
- Ételérzékenységek listája
- Statisztikák (preferenciák száma, érzékenységek száma, regisztráció óta eltelt napok)

### 3. Szerepkör módosítása
- 3 szerepkör: User (0), Moderator (1), Admin (2)
- Csak admin adhat admin jogosultságot
- Saját szerepkört nem lehet módosítani
- Biztonsági figyelmeztetés a módosítás előtt

### 4. Felhasználó tiltása/engedélyezése
- Felhasználók ideiglenes letiltása (role_id = -1)
- Tiltott felhasználók újra engedélyezése (role_id = 0)
- Saját magát nem lehet letiltani

### 5. Felhasználó törlése
- Csak admin jogosultság esetén
- Dupla megerősítés: felhasználónév beírása szükséges
- Saját magát nem lehet törölni
- Véglegesen törli a felhasználót és kapcsolódó adatait (cascade)

## Használat

### Elérés
A moderátor interfész a `/moderator-dashboard` útvonalon érhető el. A Navbar-ban automatikusan megjelenik a "Moderator" link azoknak a felhasználóknak, akiknek a role_id értéke 1 vagy 2.

### Navigáció
1. Jelentkezz be egy moderátor vagy admin fiókkal
2. Kattints a "Moderator" linkre a navigációs sávban
3. A dashboard automatikusan betölti az összes felhasználót

### Műveletek
- **Részletek megtekintése**: Kattints a három pontra (⋮) a felhasználó sorában, majd válaszd a "Részletek" opciót
- **Szerepkör módosítása**: Három pont menü → "Szerepkör módosítása"
- **Tiltás/Engedélyezés**: Három pont menü → "Tiltás/Engedélyezés"
- **Törlés**: Három pont menü → "Törlés" (csak admin)

## Komponensek

### Frontend
- `frontend/src/app/moderator-dashboard/page.tsx` - Fő dashboard oldal
- `frontend/src/components/moderator/UserManagementTable.tsx` - Felhasználók táblázat keresési és szűrési funkciókkal
- `frontend/src/components/moderator/UserDetailsModal.tsx` - Felhasználó részletek modal
- `frontend/src/components/moderator/RoleEditorModal.tsx` - Szerepkör szerkesztő modal
- `frontend/src/lib/api/moderator.ts` - API kommunikációs függvények

### Backend
- `backend/app/api/v1/endpoints/moderator.py` - Moderátor végpontok
- Endpoints:
  - `GET /api/v1/moderator/users` - Összes felhasználó listázása
  - `PATCH /api/v1/moderator/users/{user_id}/role` - Szerepkör módosítása
  - `PATCH /api/v1/moderator/users/{user_id}/status` - Tiltás/engedélyezés
  - `DELETE /api/v1/moderator/users/{user_id}` - Felhasználó törlése

## Jogosultságok

### Moderátor (role_id = 1)
- Felhasználók listázása ✓
- Felhasználói részletek megtekintése ✓
- User szerepkör módosítása (0 ↔ 1) ✓
- Felhasználók tiltása/engedélyezése ✓
- Admin jogosultság adása ✗
- Felhasználók törlése ✗

### Admin (role_id = 2)
- Minden moderátori funkció ✓
- Admin jogosultság adása ✓
- Felhasználók törlése ✓

## Biztonság

1. **Autentikáció**: JWT token alapú autentikáció szükséges minden végponthoz
2. **Autorizáció**: Csak moderátor és admin szerepkörök férhetnek hozzá
3. **Védelmek**:
   - Saját fiók módosításának tiltása
   - Admin jogosultság csak admin által adható
   - Dupla megerősítés törlésnél
   - Cascade törlés kapcsolódó adatoknál

## Telepítés

A moderátor interfész már integrálva van a projektbe. Használathoz:

1. **Backend**: A `moderator.py` endpoint automatikusan be van regisztrálva a router-ben
2. **Frontend**: A komponensek és oldalak készen állnak
3. **Teszteléshez**: Hozz létre egy teszt felhasználót és módosítsd a `role_id` értékét az adatbázisban:

```sql
-- Moderátor létrehozása
UPDATE users SET role_id = 1 WHERE username = 'test_mod';

-- Admin létrehozása
UPDATE users SET role_id = 2 WHERE username = 'test_admin';
```

## Hibakezelés

- A frontend megjelenít hibaüzeneteket, ha az API hívások sikertelenek
- A backend 403-as hibát ad vissza jogosultság hiányában
- A backend 404-es hibát ad vissza nem létező felhasználónál
- A backend 400-as hibát ad vissza hibás műveleteknél (pl. saját fiók módosítása)

## Továbbfejlesztési lehetőségek

- [ ] Tömeges műveletek (pl. több felhasználó kijelölése és törlése)
- [ ] Email értesítések módosításokról
- [ ] Audit log (naplózás) a moderátori tevékenységekről
- [ ] Felhasználói aktivitás történet
- [ ] Részletes keresési szűrők (regisztrációs dátum, aktivitás alapján)
- [ ] Export funkció (CSV, Excel)
- [ ] Grafikus statisztikák és diagramok
