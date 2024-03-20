from alembic import op

revision = '74c0ed975459'
down_revision = 'e9977b56f6dc'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename 'level.prefix' to 'name'
    op.drop_index('ix_level_prefix', table_name='level')
    op.alter_column('level', column_name='prefix', new_column_name='name')
    op.create_index(op.f('ix_level_name'), 'level', ['name'], unique=False)


def downgrade() -> None:
    # Rename 'level.name' to 'prefix'
    op.drop_index(op.f('ix_level_name'), table_name='level')
    op.alter_column('level', column_name='name', new_column_name='prefix')
    op.create_index('ix_level_prefix', 'level', ['prefix'], unique=False)
