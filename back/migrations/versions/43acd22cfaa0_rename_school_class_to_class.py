from alembic import op

revision = '43acd22cfaa0'
down_revision = '6d0a0b23b615'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename table 'school_class' to 'class'
    op.drop_index('ix_school_class_created', table_name='school_class')
    op.drop_index('ix_school_class_suffix', table_name='school_class')
    op.rename_table('school_class', 'class')
    op.create_index(op.f('ix_class_created'), 'class', ['created'], unique=False)
    op.create_index(op.f('ix_class_suffix'), 'class', ['suffix'], unique=False)

    # Rename column 'student.school_class_id' to 'class_id'
    op.drop_constraint('student_school_class_id_fkey', 'student', type_='foreignkey')
    op.alter_column('student', column_name='school_class_id', new_column_name='class_id')
    op.create_foreign_key('student_class_id', 'student', 'class', ['class_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    # Rename table 'school_class' to 'class'
    op.drop_index(op.f('ix_class_suffix'), table_name='class')
    op.drop_index(op.f('ix_class_created'), table_name='class')
    op.rename_table('class', 'school_class')
    op.create_index('ix_school_class_suffix', 'school_class', ['suffix'], unique=False)
    op.create_index('ix_school_class_created', 'school_class', ['created'], unique=False)

    # Rename column 'student.class_id' to 'school_class_id'
    op.drop_constraint('student_class_id', 'student', type_='foreignkey')
    op.alter_column('student', column_name='class_id', new_column_name='school_class_id')
    op.create_foreign_key(
        'student_school_class_id_fkey',
        'student',
        'school_class',
        ['school_class_id'],
        ['id'],
        ondelete='CASCADE',
    )
