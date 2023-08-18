import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '3de0e793db04'
down_revision = 'd58e230bcb2b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'student',
        sa.Column('can_register_to_waitlist', sa.Boolean(), server_default='false', nullable=False),
    )
    op.create_index(op.f('ix_student_can_register_to_waitlist'), 'student', ['can_register_to_waitlist'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_student_can_register_to_waitlist'), table_name='student')
    op.drop_column('student', 'can_register_to_waitlist')
