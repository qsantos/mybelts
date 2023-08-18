import sqlalchemy as sa
from alembic import op

revision = '61da631eca13'
down_revision = 'f6dcd3c9c8fe'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'waitlist_entry',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('skill_domain_id', sa.Integer(), nullable=False),
        sa.Column('belt_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['belt_id'], ['belt.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_domain_id'], ['skill_domain.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['student_id'], ['student.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_waitlist_entry_created'), 'waitlist_entry', ['created'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_waitlist_entry_created'), table_name='waitlist_entry')
    op.drop_table('waitlist_entry')
