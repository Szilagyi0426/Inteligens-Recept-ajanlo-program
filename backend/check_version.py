import sys
sys.path.insert(0, '.')
from app.db.session import engine
import sqlalchemy as sa

with engine.connect() as conn:
    result = conn.execute(sa.text('SELECT version_num FROM alembic_version'))
    versions = [row[0] for row in result]
    print("Current DB version(s):", versions)
