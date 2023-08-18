import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'f43017a29bea'
down_revision = 'e396865b2ec4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'skill_domain',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_skill_domain_created'), 'skill_domain', ['created'], unique=False)
    op.create_index(op.f('ix_skill_domain_name'), 'skill_domain', ['name'], unique=False)
    op.add_column('belt_attempt', sa.Column('skill_domain_id', sa.Integer(), nullable=False))
    op.create_foreign_key(
        'belt_attempt_skill_domain_constraint',
        'belt_attempt',
        'skill_domain',
        ['skill_domain_id'],
        ['id'],
        ondelete='CASCADE',
    )


def downgrade() -> None:
    op.drop_constraint('belt_attempt_skill_domain_constraint', 'belt_attempt', type_='foreignkey')
    op.drop_column('belt_attempt', 'skill_domain_id')
    op.drop_index(op.f('ix_skill_domain_name'), table_name='skill_domain')
    op.drop_index(op.f('ix_skill_domain_created'), table_name='skill_domain')
    op.drop_table('skill_domain')
