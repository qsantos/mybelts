import sqlalchemy as sa
from alembic import op

revision = '00c6a2eadbfd'
down_revision = '027489741c96'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'exam',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('class_level_id', sa.Integer(), nullable=False),
        sa.Column('belt_id', sa.Integer(), nullable=False),
        sa.Column('skill_domain_id', sa.Integer(), nullable=False),
        sa.Column('file', sa.LargeBinary(), nullable=False),
        sa.ForeignKeyConstraint(['belt_id'], ['belt.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['class_level_id'], ['class_level.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_domain_id'], ['skill_domain.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_exam_created'), 'exam', ['created'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_exam_created'), table_name='exam')
    op.drop_table('exam')
