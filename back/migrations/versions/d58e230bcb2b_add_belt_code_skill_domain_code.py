import sqlalchemy as sa
from alembic import op

revision = 'd58e230bcb2b'
down_revision = '28a9603077f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('belt', sa.Column('code', sa.String(), server_default='', nullable=False))
    op.create_index(op.f('ix_belt_code'), 'belt', ['code'], unique=False)
    op.add_column('skill_domain', sa.Column('code', sa.String(), server_default='', nullable=False))
    op.create_index(op.f('ix_skill_domain_code'), 'skill_domain', ['code'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_skill_domain_code'), table_name='skill_domain')
    op.drop_column('skill_domain', 'code')
    op.drop_index(op.f('ix_belt_code'), table_name='belt')
    op.drop_column('belt', 'code')
