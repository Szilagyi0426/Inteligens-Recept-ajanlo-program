"""Seed measurement units

Revision ID: 20251018_seed_units
Revises: 20251018_1k_ingredient_import
Create Date: 2025-10-18 18:35:00
"""
from alembic import op
import sqlalchemy as sa

# --- Alembic IDs ---
revision = "20251018_seed_units"
down_revision = "20251018_1k_ingredient_import"
branch_labels = None
depends_on = None

UNITS = [
    # Tömeg
    ("gram", "g"),
    ("kilogram", "kg"),
    ("milligram", "mg"),
    ("ounce", "oz"),
    ("pound", "lb"),

    # Térfogat
    ("milliliter", "ml"),
    ("liter", "l"),
    ("teaspoon", "tsp"),
    ("tablespoon", "tbsp"),
    ("cup", "cup"),
    ("pint", "pt"),
    ("quart", "qt"),
    ("gallon", "gal"),

    # Darab
    ("piece", "pc"),
    ("slice", "slice"),
    ("clove", "clove"),
    ("bunch", "bunch"),
    ("leaf", "leaf"),

    # Egyéb
    ("can", "can"),
    ("bottle", "bottle"),
    ("jar", "jar"),
    ("pack", "pack"),
    ("stick", "stick"),
]

def upgrade():
    conn = op.get_bind()
    stmt = sa.text(
        "INSERT INTO units (name) VALUES (:name) "
        "ON DUPLICATE KEY UPDATE name = VALUES(name)"
    )
    for name, _abbr in UNITS:
        conn.execute(stmt, {"name": name})

def downgrade():
    conn = op.get_bind()
    stmt = sa.text("DELETE FROM units WHERE name = :name")
    for name, _abbr in UNITS:
        conn.execute(stmt, {"name": name})