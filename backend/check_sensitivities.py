import sys
sys.path.insert(0, '.')
from app.db.session import engine
import sqlalchemy as sa

with engine.connect() as conn:
    # Ételérzékenységek
    print("=== ÉTELÉRZÉKENYSÉGEK (Food Sensitivities) ===")
    result = conn.execute(sa.text('SELECT id, name FROM food_sensitivity ORDER BY id'))
    sensitivities = result.fetchall()
    for sens in sensitivities:
        print(f"  ID: {sens[0]}, Név: {sens[1]}")
    
    print("\n=== ÉTKEZÉSI PREFERENCIÁK (Meal Preferences) ===")
    result = conn.execute(sa.text('SELECT id, name FROM meal_preference ORDER BY id'))
    preferences = result.fetchall()
    for pref in preferences:
        print(f"  ID: {pref[0]}, Név: {pref[1]}")
