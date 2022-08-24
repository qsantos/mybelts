import sqlalchemy as sa
from alembic import op

revision = '28a9603077f6'
down_revision = 'e8c024c8945c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('exam', sa.Column('code', sa.String(), server_default='', nullable=False))
    op.create_index(op.f('ix_exam_code'), 'exam', ['code'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_exam_code'), table_name='exam')
    op.drop_column('exam', 'code')
