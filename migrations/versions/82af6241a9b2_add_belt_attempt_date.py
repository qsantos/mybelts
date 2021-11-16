import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '82af6241a9b2'
down_revision = 'b97f81f7b160'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('belt_attempt', sa.Column('date', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False))
    op.create_index(op.f('ix_belt_attempt_date'), 'belt_attempt', ['date'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_belt_attempt_date'), table_name='belt_attempt')
    op.drop_column('belt_attempt', 'date')
