"""seed recipe dietary data

Revision ID: 0004_seed_recipe_dietary_data
Revises: 0003_add_recipe_dietary_info
Create Date: 2025-12-06 10:30:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
import json

revision = "0004_seed_recipe_dietary_data"
down_revision = "0003_add_recipe_dietary_info"
branch_labels = None
depends_on = None

def upgrade() -> None:
    conn = op.get_bind()
    
    # Példa adatok hozzáadása receptekhez
    # Ez csak példa, valós környezetben az alapanyagok alapján kellene meghatározni
    
    # Receptek lekérése és frissítése példa adatokkal
    recipes = conn.execute(text("SELECT id, name FROM recipes")).fetchall()
    
    for recipe_id, recipe_name in recipes:
        dietary_tags = []
        allergens = []
        
        # Példa logika a recept neve alapján
        name_lower = recipe_name.lower()
        
        # Vegetáriánus és vegán receptek
        if any(word in name_lower for word in ['vegetable', 'salad', 'mushroom', 'bean', 'lentil', 'chickpea']):
            dietary_tags.append('vegetarian')
            if 'cheese' not in name_lower and 'egg' not in name_lower and 'milk' not in name_lower:
                dietary_tags.append('vegan')
        
        # Hal/tenger gyümölcsei alapú receptek
        if any(word in name_lower for word in ['fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'lobster', 'crab', 'seafood']):
            allergens.append('fish')
            dietary_tags.append('pescatarian')
        
        if any(word in name_lower for word in ['shrimp', 'prawn', 'lobster', 'crab', 'shellfish']):
            allergens.append('shellfish')
        
        # Glutén és tejtermék azonosítása
        if any(word in name_lower for word in ['pasta', 'bread', 'flour', 'wheat']):
            allergens.append('gluten')
        else:
            dietary_tags.append('gluten-free')
            
        if any(word in name_lower for word in ['cheese', 'milk', 'cream', 'butter', 'yogurt']):
            allergens.append('lactose')
        else:
            dietary_tags.append('lactose-free')
        
        # Tojás
        if 'egg' in name_lower:
            allergens.append('egg')
        
        # Diófélék
        if any(word in name_lower for word in ['peanut', 'almond', 'walnut', 'cashew', 'nut']):
            allergens.append('tree-nut')
        
        # Frissítés - JSON stringként tároljuk
        if dietary_tags or allergens:
            conn.execute(
                text("UPDATE recipes SET dietary_tags = :tags, allergens = :allergens WHERE id = :id"),
                {
                    "tags": json.dumps(dietary_tags) if dietary_tags else None,
                    "allergens": json.dumps(allergens) if allergens else None,
                    "id": recipe_id
                }
            )

def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(text("UPDATE recipes SET dietary_tags = NULL, allergens = NULL"))
