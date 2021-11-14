import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'b97f81f7b160'
down_revision = 'f43017a29bea'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('belt', sa.Column('color', sa.String(), server_default='', nullable=False))
    op.create_index(op.f('ix_belt_color'), 'belt', ['color'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_belt_color'), table_name='belt')
    op.drop_column('belt', 'color')
