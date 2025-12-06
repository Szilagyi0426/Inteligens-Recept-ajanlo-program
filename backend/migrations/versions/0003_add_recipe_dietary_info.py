"""add recipe dietary information

Revision ID: 0003_add_recipe_dietary_info
Revises: 20251018_20_recipes
Create Date: 2025-12-06 10:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = "0003_add_recipe_dietary_info"
down_revision = "20251018_20_recipes"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add dietary_tags column to recipes table (JSON array for flexibility)
    op.add_column('recipes', sa.Column('dietary_tags', sa.JSON, nullable=True))
    op.add_column('recipes', sa.Column('allergens', sa.JSON, nullable=True))

def downgrade() -> None:
    op.drop_column('recipes', 'allergens')
    op.drop_column('recipes', 'dietary_tags')
