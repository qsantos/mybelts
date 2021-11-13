import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '84cea5c6585e'
down_revision = '0f125b59f23f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'belt_attempt',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('belt_id', sa.Integer(), nullable=False),
        sa.Column('success', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['belt_id'], ['belt.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['student.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_belt_attempt_created'), 'belt_attempt', ['created'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_belt_attempt_created'), table_name='belt_attempt')
    op.drop_table('belt_attempt')
