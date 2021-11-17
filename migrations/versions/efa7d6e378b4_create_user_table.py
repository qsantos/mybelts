import sqlalchemy as sa
from alembic import op
from sqlalchemy_utils.types.password import PasswordType  # type: ignore

# revision identifiers, used by Alembic.
revision = 'efa7d6e378b4'
down_revision = '82af6241a9b2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('password', PasswordType(), nullable=False),
        sa.Column('is_admin', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_user_created'), 'user', ['created'], unique=False)
    op.create_index(op.f('ix_user_is_admin'), 'user', ['is_admin'], unique=False)
    op.create_index(op.f('ix_user_name'), 'user', ['name'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_name'), table_name='user')
    op.drop_index(op.f('ix_user_is_admin'), table_name='user')
    op.drop_index(op.f('ix_user_created'), table_name='user')
    op.drop_table('user')
