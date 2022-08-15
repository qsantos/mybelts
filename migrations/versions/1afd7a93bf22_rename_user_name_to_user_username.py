from alembic import op

revision = '1afd7a93bf22'
down_revision = '0816ba70e9a8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('user', 'name', new_column_name='username')
    op.drop_index('ix_user_name', table_name='user')
    op.create_index(op.f('ix_user_username'), 'user', ['username'], unique=True)


def downgrade() -> None:
    op.alter_column('user', 'username', new_column_name='name')
    op.drop_index(op.f('ix_user_username'), table_name='user')
    op.create_index('ix_user_name', 'user', ['name'], unique=False)
