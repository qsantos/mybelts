import sqlalchemy as sa
from alembic import op

revision = 'e8c024c8945c'
down_revision = '00c6a2eadbfd'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('exam', sa.Column('filename', sa.String(), nullable=False))
    op.create_index(op.f('ix_exam_filename'), 'exam', ['filename'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_exam_filename'), table_name='exam')
    op.drop_column('exam', 'filename')
