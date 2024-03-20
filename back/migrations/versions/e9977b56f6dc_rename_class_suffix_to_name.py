from alembic import op

revision = 'e9977b56f6dc'
down_revision = '43acd22cfaa0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename 'class.suffix' to 'name'
    op.drop_index('ix_class_suffix', table_name='class')
    op.alter_column('class', column_name='suffix', new_column_name='name')
    op.create_index(op.f('ix_class_name'), 'class', ['name'], unique=False)


def downgrade() -> None:
    # Rename 'class.name' to 'suffix'
    op.drop_index(op.f('ix_class_name'), table_name='class')
    op.alter_column('class', column_name='name', new_column_name='suffix')
    op.create_index('ix_class_suffix', 'class', ['suffix'], unique=False)
