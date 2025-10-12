"""init schema for recipe recommender (mysql)

Revision ID: 0001_init_schema
Revises:
Create Date: 2025-10-12 10:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision = "0001_init_schema"
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    table_kwargs = {
        "mysql_engine": "InnoDB",
        "mysql_charset": "utf8mb4",
        "mysql_collate": "utf8mb4_0900_ai_ci",
    }

    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role_id", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")),
        **table_kwargs,
    )
    op.create_unique_constraint("uq_users_username", "users", ["username"])
    op.create_unique_constraint("uq_users_email", "users", ["email"])

    op.create_table(
        "user_profile",
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("area_code", sa.String(10)),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")),
        **table_kwargs,
    )

    op.create_table(
        "meal_preference",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(100), nullable=False),
        **table_kwargs,
    )
    op.create_unique_constraint("uq_meal_preference_name", "meal_preference", ["name"])

    op.create_table(
        "food_sensitivity",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(100), nullable=False),
        **table_kwargs,
    )
    op.create_unique_constraint("uq_food_sensitivity_name", "food_sensitivity", ["name"])

    op.create_table(
        "user_meal_preference",
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("preference_id", sa.BigInteger(), sa.ForeignKey("meal_preference.id", ondelete="CASCADE"), nullable=False),
        sa.PrimaryKeyConstraint("user_id", "preference_id", name="pk_user_meal_preference"),
        **table_kwargs,
    )
    op.create_index("ix_user_meal_preference_user", "user_meal_preference", ["user_id"])
    op.create_index("ix_user_meal_preference_pref", "user_meal_preference", ["preference_id"])

    op.create_table(
        "user_sensitivity",
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sensitivity_id", sa.BigInteger(), sa.ForeignKey("food_sensitivity.id", ondelete="CASCADE"), nullable=False),
        sa.PrimaryKeyConstraint("user_id", "sensitivity_id", name="pk_user_sensitivity"),
        **table_kwargs,
    )
    op.create_index("ix_user_sensitivity_user", "user_sensitivity", ["user_id"])
    op.create_index("ix_user_sensitivity_sens", "user_sensitivity", ["sensitivity_id"])

    op.create_table(
        "search_history",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("query", mysql.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        **table_kwargs,
    )
    op.create_index("ix_search_history_user_time", "search_history", ["user_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_search_history_user_time", table_name="search_history")
    op.drop_table("search_history")

    op.drop_index("ix_user_sensitivity_sens", table_name="user_sensitivity")
    op.drop_index("ix_user_sensitivity_user", table_name="user_sensitivity")
    op.drop_table("user_sensitivity")

    op.drop_index("ix_user_meal_preference_pref", table_name="user_meal_preference")
    op.drop_index("ix_user_meal_preference_user", table_name="user_meal_preference")
    op.drop_table("user_meal_preference")

    op.drop_constraint("uq_food_sensitivity_name", "food_sensitivity", type_="unique")
    op.drop_table("food_sensitivity")

    op.drop_constraint("uq_meal_preference_name", "meal_preference", type_="unique")
    op.drop_table("meal_preference")

    op.drop_table("user_profile")

    op.drop_constraint("uq_users_email", "users", type_="unique")
    op.drop_constraint("uq_users_username", "users", type_="unique")
    op.drop_table("users")