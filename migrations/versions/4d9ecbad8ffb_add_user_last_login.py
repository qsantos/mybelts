import sqlalchemy as sa
from alembic import op

revision = '4d9ecbad8ffb'
down_revision = '0047c7dd7f5b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('user', sa.Column('last_login', sa.DateTime(timezone=True), nullable=True))
    op.create_index(op.f('ix_user_last_login'), 'user', ['last_login'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_last_login'), table_name='user')
    op.drop_column('user', 'last_login')
