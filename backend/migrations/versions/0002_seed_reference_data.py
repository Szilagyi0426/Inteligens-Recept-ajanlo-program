"""seed reference data (preferences, sensitivities)

Revision ID: 0002_seed_reference_data
Revises: 0001_init_schema
Create Date: 2025-10-12 10:10:00
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_seed_reference_data"
down_revision = "0001_init_schema"
branch_labels = None
depends_on = None

def upgrade() -> None:
    pref_table = sa.table("meal_preference",
                          sa.column("name", sa.String(100))
                          )
    sens_table = sa.table("food_sensitivity",
                          sa.column("name", sa.String(100))
                          )

    op.bulk_insert(pref_table, [
        {"name": "vegetarian"},
        {"name": "vegan"},
        {"name": "gluten-free"},
        {"name": "lactose-free"},
        {"name": "low-carb"},
        {"name": "halal"},
        {"name": "kosher"},
    ])

    op.bulk_insert(sens_table, [
        {"name": "gluten"},
        {"name": "lactose"},
        {"name": "peanut"},
        {"name": "tree-nut"},
        {"name": "egg"},
        {"name": "soy"},
        {"name": "fish"},
        {"name": "shellfish"},
        {"name": "sesame"},
    ])

def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM user_meal_preference"))
    conn.execute(sa.text("DELETE FROM user_sensitivity"))
    conn.execute(sa.text("DELETE FROM meal_preference"))
    conn.execute(sa.text("DELETE FROM food_sensitivity"))