import sqlalchemy as sa
from alembic import op

revision = 'f44cb73e4289'
down_revision = '1afd7a93bf22'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('student', 'user_id', existing_type=sa.INTEGER(), nullable=False)


def downgrade() -> None:
    op.alter_column('student', 'user_id', existing_type=sa.INTEGER(), nullable=True)
