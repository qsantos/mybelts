import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '1a74057defad'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'belt',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_belt_created'), 'belt', ['created'], unique=False)
    op.create_index(op.f('ix_belt_name'), 'belt', ['name'], unique=False)
    op.create_index(op.f('ix_belt_rank'), 'belt', ['rank'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_belt_rank'), table_name='belt')
    op.drop_index(op.f('ix_belt_name'), table_name='belt')
    op.drop_index(op.f('ix_belt_created'), table_name='belt')
    op.drop_table('belt')
