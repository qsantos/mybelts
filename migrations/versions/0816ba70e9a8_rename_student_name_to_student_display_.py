from alembic import op

revision = '0816ba70e9a8'
down_revision = '602ffc9cdded'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('student', 'name', new_column_name='display_name')
    op.drop_index('ix_student_name', table_name='student')
    op.create_index(op.f('ix_student_display_name'), 'student', ['display_name'], unique=False)


def downgrade() -> None:
    op.alter_column('student', 'display_name', new_column_name='name')
    op.drop_index(op.f('ix_student_display_name'), table_name='student')
    op.create_index('ix_student_name', 'student', ['name'], unique=False)
