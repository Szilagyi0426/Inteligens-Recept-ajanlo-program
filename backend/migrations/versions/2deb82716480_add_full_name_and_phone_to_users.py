"""add full_name and phone to users

Revision ID: 2deb82716480
Revises: 0002_seed_reference_data
Create Date: 2025-10-16 12:13:49.425319
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2deb82716480'
down_revision = '0002_seed_reference_data'
branch_labels = None
depends_on = None

def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("full_name", sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column("phone", sa.String(length=30), nullable=True))

def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("phone")
        batch_op.drop_column("full_name")