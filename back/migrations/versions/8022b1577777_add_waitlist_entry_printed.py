import sqlalchemy as sa
from alembic import op

revision = '8022b1577777'
down_revision = '3de0e793db04'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('waitlist_entry', sa.Column('last_printed', sa.DateTime(timezone=True), nullable=True))
    op.create_index(op.f('ix_waitlist_entry_last_printed'), 'waitlist_entry', ['last_printed'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_waitlist_entry_last_printed'), table_name='waitlist_entry')
    op.drop_column('waitlist_entry', 'last_printed')
