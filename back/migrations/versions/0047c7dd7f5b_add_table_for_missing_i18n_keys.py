import sqlalchemy as sa
from alembic import op

revision = '0047c7dd7f5b'
down_revision = 'f44cb73e4289'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'missing_i18n_key',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('language', sa.String(), nullable=False),
        sa.Column('namespace', sa.String(), nullable=False),
        sa.Column('key', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_missing_i18n_key_created'), 'missing_i18n_key', ['created'], unique=False)
    op.create_index(op.f('ix_missing_i18n_key_key'), 'missing_i18n_key', ['key'], unique=False)
    op.create_index(op.f('ix_missing_i18n_key_language'), 'missing_i18n_key', ['language'], unique=False)
    op.create_index(op.f('ix_missing_i18n_key_namespace'), 'missing_i18n_key', ['namespace'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_missing_i18n_key_namespace'), table_name='missing_i18n_key')
    op.drop_index(op.f('ix_missing_i18n_key_language'), table_name='missing_i18n_key')
    op.drop_index(op.f('ix_missing_i18n_key_key'), table_name='missing_i18n_key')
    op.drop_index(op.f('ix_missing_i18n_key_created'), table_name='missing_i18n_key')
    op.drop_table('missing_i18n_key')
