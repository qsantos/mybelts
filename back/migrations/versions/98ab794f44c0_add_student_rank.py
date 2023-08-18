import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '98ab794f44c0'
down_revision = 'd66c585f6cfc'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('student', sa.Column('rank', sa.Integer(), server_default='0', nullable=False))
    op.create_index(op.f('ix_student_rank'), 'student', ['rank'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_student_rank'), table_name='student')
    op.drop_column('student', 'rank')
