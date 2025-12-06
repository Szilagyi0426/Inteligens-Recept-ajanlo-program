"""Seed ~20 recipes with ingredients and steps (author_id=0)

Revision ID: 20251018_20_recipes
Revises: 2deb82716480
Create Date: 2025-10-18 20:10:00
"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

revision = "20251018_20_recipes"
down_revision = "2deb82716480"   # <-- ÁLLÍTSD, ha más az előző rev!
branch_labels = None
depends_on = None

# ---- Helpers
def _get_id_by_name(conn, table, name):
    row = conn.execute(sa.text(f"SELECT id FROM {table} WHERE name = :n"), {"n": name}).fetchone()
    if not row:
        raise RuntimeError(f"Missing '{name}' in table '{table}'. Please seed it first.")
    return row[0]

def _get_unit_id(conn, name): return _get_id_by_name(conn, "units", name)
def _get_ingredient_id(conn, name): return _get_id_by_name(conn, "ingredients", name)

def _get_or_create_recipe(conn, rec):
    r = conn.execute(sa.text("SELECT id FROM recipes WHERE name = :n"), {"n": rec["name"]}).fetchone()
    if r:
        return r[0]
    now = datetime.utcnow()
    ins = sa.text("""
                  INSERT INTO recipes
                  (authorID, name, description, servings, prep_minutes, cook_minutes, total_minutes, visibility, created_at, updated_at)
                  VALUES (:authorID, :name, :description, :servings, :prep_minutes, :cook_minutes, :total_minutes, :visibility, :created_at, :updated_at)
                  """)
    params = {
        "authorID": 1, "name": rec["name"], "description": rec["description"],
        "servings": rec["servings"], "prep_minutes": rec["prep_minutes"],
        "cook_minutes": rec["cook_minutes"], "total_minutes": rec["total_minutes"],
        "visibility": "public", "created_at": now, "updated_at": now,
    }
    res = conn.execute(ins, params)
    return res.lastrowid

def _add_recipe_ingredients(conn, recipe_id, items):
    ins = sa.text("""
                  INSERT INTO recipe_ingredients (ingredient_id, recipe_id, unit_id, quantity)
                  VALUES (:ingredient_id, :recipe_id, :unit_id, :quantity)
                  """)
    for it in items:
        ing_id = _get_ingredient_id(conn, it["ingredient"])
        unit_id = _get_unit_id(conn, it["unit"])
        conn.execute(ins, {
            "ingredient_id": ing_id, "recipe_id": recipe_id,
            "unit_id": unit_id, "quantity": it["qty"],
        })

def _replace_recipe_steps(conn, recipe_id, steps):
    # Idempotens: töröljük a meglévő lépéseket, majd beszúrjuk sorban
    conn.execute(sa.text("DELETE FROM recipe_step WHERE recipe_id = :r"), {"r": recipe_id})
    ins = sa.text("""
                  INSERT INTO recipe_step (recipe_id, recipe_step_index, text, tip)
                  VALUES (:recipe_id, :idx, :text, :tip)
                  """)
    for idx, st in enumerate(steps, start=1):
        conn.execute(ins, {
            "recipe_id": recipe_id,
            "idx": idx,
            "text": st.get("text", ""),
            "tip": st.get("tip", None),
        })

# ---- 20 recept (ugyanazok a hozzávalók, mint korábban) + lépések
RECIPES = [
    {
        "name": "Fresh Fruit Salad",
        "description": "Egyszerű gyümölcssaláta friss hozzávalókból.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 0, "total_minutes": 10,
        "items": [
            {"ingredient": "Fresh Apple", "qty": 1, "unit": "piece"},
            {"ingredient": "Fresh Banana", "qty": 1, "unit": "piece"},
            {"ingredient": "Fresh Orange", "qty": 1, "unit": "piece"},
            {"ingredient": "Fresh Strawberry", "qty": 8, "unit": "piece"},
            {"ingredient": "Fresh Blueberry", "qty": 1.0, "unit": "cup"},
        ],
        "steps": [
            {"text": "Moss meg és darabolj fel minden gyümölcsöt harapásnyi kockákra."},
            {"text": "Keverd össze egy nagy tálban.", "tip": "Pár csepp citromlé megőrzi a színeket."},
        ],
    },
    {
        "name": "Tomato-Cucumber Salad",
        "description": "Friss paradicsom-uborka saláta.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 0, "total_minutes": 10,
        "items": [
            {"ingredient": "Fresh Tomato", "qty": 2, "unit": "piece"},
            {"ingredient": "Fresh Cucumber", "qty": 1, "unit": "piece"},
            {"ingredient": "Fresh Red Onion", "qty": 0.25, "unit": "piece"},
            {"ingredient": "Balsamic Vinegar", "qty": 1, "unit": "tablespoon"},
        ],
        "steps": [
            {"text": "Szeleteld fel a paradicsomot, uborkát és a vöröshagymát."},
            {"text": "Locsold meg balzsamecettel és óvatosan forgasd össze.", "tip": "Sózd tálalás előtt közvetlenül."},
        ],
    },
    {
        "name": "Simple Chicken & Rice Bowl",
        "description": "Főtt rizs friss csirkemellel és brokkolival.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 20, "total_minutes": 30,
        "items": [
            {"ingredient": "Cooked Rice", "qty": 300, "unit": "gram"},
            {"ingredient": "Fresh Broccoli", "qty": 200, "unit": "gram"},
            {"ingredient": "Boneless Chicken Breast", "qty": 300, "unit": "gram"},
        ],
        "steps": [
            {"text": "Vágd csíkokra a csirkét és párold kevés olajon."},
            {"text": "Adj hozzá brokkolit és párold roppanósra."},
            {"text": "Tálald főtt rizzsel."},
        ],
    },
    {
        "name": "Mushroom Pasta (Quick)",
        "description": "Főtt tészta gombával.",
        "servings": 2, "prep_minutes": 5, "cook_minutes": 15, "total_minutes": 20,
        "items": [
            {"ingredient": "Cooked Pasta", "qty": 250, "unit": "gram"},
            {"ingredient": "Fresh Mushroom", "qty": 200, "unit": "gram"},
            {"ingredient": "Fresh Parsnip", "qty": 1, "unit": "piece"},
        ],
        "steps": [
            {"text": "Pirítsd a felszeletelt gombát nagy lángon."},
            {"text": "Add hozzá a reszelt paszternákot, keverd a tésztához."},
        ],
    },
    {
        "name": "Avocado & Tomato Topping",
        "description": "Avokádó-paradicsom feltét pirítósra.",
        "servings": 2, "prep_minutes": 5, "cook_minutes": 0, "total_minutes": 5,
        "items": [
            {"ingredient": "Fresh Avocado", "qty": 1, "unit": "piece"},
            {"ingredient": "Fresh Tomato", "qty": 1, "unit": "piece"},
            {"ingredient": "Fresh Lemon", "qty": 0.5, "unit": "piece"},
        ],
        "steps": [
            {"text": "Törd össze az avokádót, keverd el aprított paradicsommal."},
            {"text": "Ízesítsd citromlével."},
        ],
    },
    {
        "name": "Berry Mix Cup",
        "description": "Bogyós gyümölcs keverék csészében.",
        "servings": 2, "prep_minutes": 5, "cook_minutes": 0, "total_minutes": 5,
        "items": [
            {"ingredient": "Fresh Blueberry", "qty": 1, "unit": "cup"},
            {"ingredient": "Fresh Raspberry", "qty": 1, "unit": "cup"},
            {"ingredient": "Fresh Blackberry", "qty": 1, "unit": "cup"},
        ],
        "steps": [
            {"text": "Mosd meg a bogyós gyümölcsöket és töltsd csészékbe."},
        ],
    },
    {
        "name": "Chicken Broth Veggie Soup",
        "description": "Csirkehúsleves zöldségekkel.",
        "servings": 4, "prep_minutes": 10, "cook_minutes": 30, "total_minutes": 40,
        "items": [
            {"ingredient": "Chicken Broth", "qty": 1200, "unit": "milliliter"},
            {"ingredient": "Fresh Carrot", "qty": 2, "unit": "piece"},
            {"ingredient": "Fresh Celery", "qty": 2, "unit": "piece"},
            {"ingredient": "Fresh Onion", "qty": 1, "unit": "piece"},
            {"ingredient": "Fresh Potato", "qty": 2, "unit": "piece"},
        ],
        "steps": [
            {"text": "Forrald fel a csirkehúslevet."},
            {"text": "Add hozzá a felaprított zöldségeket és főzd puhára."},
        ],
    },
    {
        "name": "Tuna Rice Bowl",
        "description": "Rizstál friss tonhallal, avokádóval.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 0, "total_minutes": 10,
        "items": [
            {"ingredient": "Cooked Rice", "qty": 250, "unit": "gram"},
            {"ingredient": "Fresh Tuna", "qty": 200, "unit": "gram"},
            {"ingredient": "Fresh Avocado", "qty": 1, "unit": "piece"},
            {"ingredient": "Fresh Cucumber", "qty": 0.5, "unit": "piece"},
            {"ingredient": "Dark Soy Sauce", "qty": 2, "unit": "teaspoon"},
        ],
        "steps": [
            {"text": "Kockázd fel a tonhalat és az avokádót."},
            {"text": "Halmozd a rizsre, locsold szójaszósszal."},
        ],
    },
    {
        "name": "Salmon, Rice & Broccoli",
        "description": "Lazac rizzsel és brokkolival.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 20, "total_minutes": 30,
        "items": [
            {"ingredient": "Fresh Salmon", "qty": 250, "unit": "gram"},
            {"ingredient": "Cooked Rice", "qty": 250, "unit": "gram"},
            {"ingredient": "Fresh Broccoli", "qty": 200, "unit": "gram"},
            {"ingredient": "Fresh Lemon", "qty": 0.5, "unit": "piece"},
        ],
        "steps": [
            {"text": "Süsd meg a lazacot serpenyőben."},
            {"text": "Párold a brokkolit, tálald rizzsel és citrommal."},
        ],
    },
    {
        "name": "Shrimp Noodle Stir",
        "description": "Ropogós zöldséges tészta friss garnélával.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 10, "total_minutes": 20,
        "items": [
            {"ingredient": "Cooked Noodles", "qty": 250, "unit": "gram"},
            {"ingredient": "Fresh Shrimp", "qty": 200, "unit": "gram"},
            {"ingredient": "Fresh Red Bell Pepper", "qty": 0.5, "unit": "piece"},
            {"ingredient": "Dark Soy Sauce", "qty": 1, "unit": "tablespoon"},
        ],
        "steps": [
            {"text": "Pirítsd a garnélát nagy lángon röviden."},
            {"text": "Add hozzá a tésztát és a paprikát, forgasd át szójaszósszal."},
        ],
    },
    {
        "name": "Beef & Mushroom Soba",
        "description": "Soba tészta darált marhával és gombával.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 15, "total_minutes": 25,
        "items": [
            {"ingredient": "Cooked Soba", "qty": 250, "unit": "gram"},
            {"ingredient": "Boneless Ground Beef", "qty": 200, "unit": "gram"},
            {"ingredient": "Fresh Mushroom", "qty": 150, "unit": "gram"},
            {"ingredient": "Dark Soy Sauce", "qty": 1, "unit": "tablespoon"},
        ],
        "steps": [
            {"text": "Pirítsd a darált marhát, add hozzá a gombát."},
            {"text": "Forgasd össze a sobával és a szójaszósszal."},
        ],
    },
    {
        "name": "Quinoa Veggie Salad",
        "description": "Könnyű quinoa saláta friss zöldségekkel.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 0, "total_minutes": 10,
        "items": [
            {"ingredient": "Cooked Quinoa", "qty": 200, "unit": "gram"},
            {"ingredient": "Fresh Cucumber", "qty": 0.5, "unit": "piece"},
            {"ingredient": "Fresh Tomato", "qty": 1, "unit": "piece"},
            {"ingredient": "Fresh Spinach", "qty": 2, "unit": "cup"},
            {"ingredient": "Balsamic Vinegar", "qty": 1, "unit": "tablespoon"},
        ],
        "steps": [
            {"text": "Keverd össze a főtt quinoát a felaprított zöldségekkel."},
            {"text": "Ízesítsd balzsamecettel."},
        ],
    },
    {
        "name": "Couscous with Chicken & Veg",
        "description": "Kuszkusz csirkével és zöldségekkel.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 10, "total_minutes": 20,
        "items": [
            {"ingredient": "Cooked Couscous", "qty": 200, "unit": "gram"},
            {"ingredient": "Boneless Chicken Breast", "qty": 200, "unit": "gram"},
            {"ingredient": "Fresh Zucchini", "qty": 0.5, "unit": "piece"},
            {"ingredient": "Fresh Carrot", "qty": 1, "unit": "piece"},
        ],
        "steps": [
            {"text": "Kockázd a csirkét, pirítsd le."},
            {"text": "Keverd a párolt zöldségekkel és a kuszkusszal."},
        ],
    },
    {
        "name": "Udon with Mushrooms & Spring Onion",
        "description": "Udon tészta gombával és újhagymával.",
        "servings": 2, "prep_minutes": 8, "cook_minutes": 12, "total_minutes": 20,
        "items": [
            {"ingredient": "Cooked Udon", "qty": 250, "unit": "gram"},
            {"ingredient": "Fresh Mushroom", "qty": 200, "unit": "gram"},
            {"ingredient": "Fresh Spring Onion", "qty": 2, "unit": "piece"},
            {"ingredient": "Dark Soy Sauce", "qty": 2, "unit": "teaspoon"},
        ],
        "steps": [
            {"text": "Szeleteld a gombát és az újhagymát, pirítsd meg röviden."},
            {"text": "Forgasd össze az udonnal és a szójaszósszal."},
        ],
    },
    {
        "name": "Red Lentil Chicken Soup",
        "description": "Vöröslencse-leves csirkehúsalaplével.",
        "servings": 4, "prep_minutes": 10, "cook_minutes": 25, "total_minutes": 35,
        "items": [
            {"ingredient": "Dried Red Lentil", "qty": 180, "unit": "gram"},
            {"ingredient": "Chicken Broth", "qty": 1200, "unit": "milliliter"},
            {"ingredient": "Fresh Carrot", "qty": 1, "unit": "piece"},
            {"ingredient": "Fresh Celery", "qty": 1, "unit": "piece"},
            {"ingredient": "Fresh Red Onion", "qty": 0.5, "unit": "piece"},
        ],
        "steps": [
            {"text": "Öblítsd át a lencsét."},
            {"text": "Főzd meg az alaplében a zöldségekkel együtt."},
        ],
    },
    {
        "name": "Chickpea Stew",
        "description": "Egyszerű csicseriborsó ragu.",
        "servings": 3, "prep_minutes": 10, "cook_minutes": 30, "total_minutes": 40,
        "items": [
            {"ingredient": "Dried Chickpea", "qty": 200, "unit": "gram"},
            {"ingredient": "Chicken Broth", "qty": 800, "unit": "milliliter"},
            {"ingredient": "Fresh Tomato", "qty": 2, "unit": "piece"},
            {"ingredient": "Fresh Onion", "qty": 1, "unit": "piece"},
        ],
        "steps": [
            {"text": "Ha száraz csicserit használsz, előző este áztasd be."},
            {"text": "Főzd puhára az alaplében a zöldségekkel."},
        ],
    },
    {
        "name": "Eggplant Spaghetti",
        "description": "Padlizsános spagetti paradicsommal és fokhagymával.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 20, "total_minutes": 30,
        "items": [
            {"ingredient": "Cooked Spaghetti", "qty": 250, "unit": "gram"},
            {"ingredient": "Fresh Eggplant", "qty": 200, "unit": "gram"},
            {"ingredient": "Fresh Tomato", "qty": 2, "unit": "piece"},
            {"ingredient": "Fresh Garlic", "qty": 2, "unit": "clove"},
        ],
        "steps": [
            {"text": "Süsd a kockázott padlizsánt kevés olajon aranybarnára."},
            {"text": "Add hozzá a paradicsomot és a fokhagymát, forgasd a tésztához."},
        ],
    },
    {
        "name": "Pork Fried Rice (Home Style)",
        "description": "Sertéses zöldséges pirított rizs.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 15, "total_minutes": 25,
        "items": [
            {"ingredient": "Cooked Rice", "qty": 300, "unit": "gram"},
            {"ingredient": "Boneless Ground Pork", "qty": 200, "unit": "gram"},
            {"ingredient": "Fresh Peas", "qty": 1, "unit": "cup"},
            {"ingredient": "Fresh Carrot", "qty": 1, "unit": "piece"},
            {"ingredient": "Dark Soy Sauce", "qty": 1, "unit": "tablespoon"},
        ],
        "steps": [
            {"text": "Pirítsd le a darált húst."},
            {"text": "Add hozzá a rizst, zöldségeket és a szójaszószt, forgasd össze."},
        ],
    },
    {
        "name": "Turkey Basmati Bowl",
        "description": "Pulykás basmati rizstál.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 15, "total_minutes": 25,
        "items": [
            {"ingredient": "Cooked Basmati Rice", "qty": 300, "unit": "gram"},
            {"ingredient": "Boneless Ground Turkey", "qty": 220, "unit": "gram"},
            {"ingredient": "Fresh Green Bell Pepper", "qty": 0.5, "unit": "piece"},
        ],
        "steps": [
            {"text": "Pirítsd meg a darált pulykát."},
            {"text": "Forgasd össze a rizzsel és a felkockázott paprikával."},
        ],
    },
    {
        "name": "Beef Ramen Bowl",
        "description": "Marhás ramen spenóttal.",
        "servings": 2, "prep_minutes": 10, "cook_minutes": 10, "total_minutes": 20,
        "items": [
            {"ingredient": "Cooked Ramen", "qty": 250, "unit": "gram"},
            {"ingredient": "Boneless Ground Beef", "qty": 200, "unit": "gram"},
            {"ingredient": "Fresh Spinach", "qty": 2, "unit": "cup"},
            {"ingredient": "Dark Soy Sauce", "qty": 1, "unit": "tablespoon"},
            {"ingredient": "Dashi", "qty": 1, "unit": "teaspoon"},
        ],
        "steps": [
            {"text": "Forrósítsd fel az alaplevet (ha használsz)."},
            {"text": "Add hozzá a tésztát, húst és a spenótot, ízesítsd."},
        ],
    },
]

def upgrade():
    conn = op.get_bind()
    for rec in RECIPES:
        rid = _get_or_create_recipe(conn, rec)
        _add_recipe_ingredients(conn, rid, rec["items"])
        _replace_recipe_steps(conn, rid, rec["steps"])

def downgrade():
    conn = op.get_bind()
    for rec in RECIPES:
        row = conn.execute(sa.text("SELECT id FROM recipes WHERE name = :n"), {"n": rec["name"]}).fetchone()
        if row:
            rid = row[0]
            conn.execute(sa.text("DELETE FROM recipe_step WHERE recipe_id = :r"), {"r": rid})
            conn.execute(sa.text("DELETE FROM recipe_ingredients WHERE recipe_id = :r"), {"r": rid})
            conn.execute(sa.text("DELETE FROM recipes WHERE id = :r AND authorID = 0"), {"r": rid})