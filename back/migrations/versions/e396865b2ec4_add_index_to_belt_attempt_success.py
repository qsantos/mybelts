from alembic import op

# revision identifiers, used by Alembic.
revision = 'e396865b2ec4'
down_revision = '84cea5c6585e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(op.f('ix_belt_attempt_success'), 'belt_attempt', ['success'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_belt_attempt_success'), table_name='belt_attempt')
