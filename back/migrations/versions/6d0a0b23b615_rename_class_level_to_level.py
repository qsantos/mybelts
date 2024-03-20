from alembic import op

revision = '6d0a0b23b615'
down_revision = '8022b1577777'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Rename table 'class_level' to 'level'
    op.drop_index('ix_class_level_created', table_name='class_level')
    op.drop_index('ix_class_level_prefix', table_name='class_level')
    op.rename_table('class_level', 'level')
    op.create_index(op.f('ix_level_created'), 'level', ['created'], unique=False)
    op.create_index(op.f('ix_level_prefix'), 'level', ['prefix'], unique=False)

    # Rename column 'exam.class_level_id' to 'level_id'
    op.drop_constraint('exam_class_level_id_fkey', 'exam', type_='foreignkey')
    op.alter_column('exam', column_name='class_level_id', new_column_name='level_id')
    op.create_foreign_key(None, 'exam', 'level', ['level_id'], ['id'], ondelete='CASCADE')

    # Rename column 'school_class.class_level_id' to 'level_id'
    op.drop_constraint('school_class_class_level_id_fkey', 'school_class', type_='foreignkey')
    op.alter_column('school_class', column_name='class_level_id', new_column_name='level_id')
    op.create_foreign_key(None, 'school_class', 'level', ['level_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    # Rename table 'level' to 'class_level'
    op.drop_index(op.f('ix_level_prefix'), table_name='level')
    op.drop_index(op.f('ix_level_created'), table_name='level')
    op.rename_table('level', 'class_level')
    op.create_index('ix_class_level_prefix', 'class_level', ['prefix'], unique=False)
    op.create_index('ix_class_level_created', 'class_level', ['created'], unique=False)

    # Rename column 'exam.level_id' to 'class_level_id'
    op.drop_constraint('exam_level_id_fkey', 'exam', type_='foreignkey')
    op.alter_column('exam', column_name='level_id', new_column_name='class_level_id')
    op.create_foreign_key(
        'exam_class_level_id_fkey',
        'exam',
        'class_level',
        ['class_level_id'],
        ['id'],
        ondelete='CASCADE',
    )

    # Rename column 'school_class.level_id' to 'class_level_id'
    op.drop_constraint('school_class_level_id_fkey', 'school_class', type_='foreignkey')
    op.alter_column('school_class', column_name='level_id', new_column_name='class_level_id')
    op.create_foreign_key(
        'school_class_class_level_id_fkey',
        'school_class',
        'class_level',
        ['class_level_id'],
        ['id'],
        ondelete='CASCADE',
    )
