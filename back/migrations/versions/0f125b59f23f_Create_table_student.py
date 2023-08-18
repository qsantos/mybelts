import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '0f125b59f23f'
down_revision = '1a74057defad'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'class_level',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('prefix', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_class_level_created'), 'class_level', ['created'], unique=False)
    op.create_index(op.f('ix_class_level_prefix'), 'class_level', ['prefix'], unique=False)
    op.create_table(
        'school_class',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('class_level_id', sa.Integer(), nullable=False),
        sa.Column('suffix', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['class_level_id'], ['class_level.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_school_class_created'), 'school_class', ['created'], unique=False)
    op.create_index(op.f('ix_school_class_suffix'), 'school_class', ['suffix'], unique=False)
    op.create_table(
        'student',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('school_class_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['school_class_id'], ['school_class.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_student_created'), 'student', ['created'], unique=False)
    op.create_index(op.f('ix_student_name'), 'student', ['name'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_student_name'), table_name='student')
    op.drop_index(op.f('ix_student_created'), table_name='student')
    op.drop_table('student')
    op.drop_index(op.f('ix_school_class_suffix'), table_name='school_class')
    op.drop_index(op.f('ix_school_class_created'), table_name='school_class')
    op.drop_table('school_class')
    op.drop_index(op.f('ix_class_level_prefix'), table_name='class_level')
    op.drop_index(op.f('ix_class_level_created'), table_name='class_level')
    op.drop_table('class_level')
