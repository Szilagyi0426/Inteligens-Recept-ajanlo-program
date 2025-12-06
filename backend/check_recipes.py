import sys
sys.path.insert(0, '.')
from app.db.session import engine
import sqlalchemy as sa

with engine.connect() as conn:
    result = conn.execute(sa.text('SELECT id, name, dietary_tags, allergens FROM recipes LIMIT 5'))
    recipes = result.fetchall()
    for recipe in recipes:
        print(f"ID: {recipe[0]}, Name: {recipe[1]}")
        print(f"  Dietary tags: {recipe[2]}")
        print(f"  Allergens: {recipe[3]}")
        print()
