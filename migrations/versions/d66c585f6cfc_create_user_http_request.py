import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision = 'd66c585f6cfc'
down_revision = 'efa7d6e378b4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'http_request',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('request_remote_addr', sa.String(), nullable=False),
        sa.Column('request_method', sa.String(), nullable=False),
        sa.Column('request_url', sa.String(), nullable=False),
        sa.Column('request_path', sa.String(), nullable=False),
        sa.Column('request_headers', JSONB(), nullable=False),
        sa.Column('request_body', sa.LargeBinary(), nullable=True),
        sa.Column('response_status_code', sa.Integer(), nullable=False),
        sa.Column('response_status', sa.String(), nullable=False),
        sa.Column('response_headers', JSONB(), nullable=False),
        sa.Column('response_body', sa.LargeBinary(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_http_request_created'), 'http_request', ['created'], unique=False)
    op.create_index(op.f('ix_http_request_request_headers'), 'http_request', ['request_headers'], unique=False)
    op.create_index(op.f('ix_http_request_request_method'), 'http_request', ['request_method'], unique=False)
    op.create_index(op.f('ix_http_request_request_path'), 'http_request', ['request_path'], unique=False)
    op.create_index(op.f('ix_http_request_request_remote_addr'), 'http_request', ['request_remote_addr'], unique=False)
    op.create_index(op.f('ix_http_request_request_url'), 'http_request', ['request_url'], unique=False)
    op.create_index(op.f('ix_http_request_response_headers'), 'http_request', ['response_headers'], unique=False)
    op.create_index(op.f('ix_http_request_response_status'), 'http_request', ['response_status'], unique=False)
    op.create_index(op.f('ix_http_request_response_status_code'), 'http_request', ['response_status_code'],
                    unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_http_request_response_status_code'), table_name='http_request')
    op.drop_index(op.f('ix_http_request_response_status'), table_name='http_request')
    op.drop_index(op.f('ix_http_request_response_headers'), table_name='http_request')
    op.drop_index(op.f('ix_http_request_request_url'), table_name='http_request')
    op.drop_index(op.f('ix_http_request_request_remote_addr'), table_name='http_request')
    op.drop_index(op.f('ix_http_request_request_path'), table_name='http_request')
    op.drop_index(op.f('ix_http_request_request_method'), table_name='http_request')
    op.drop_index(op.f('ix_http_request_request_headers'), table_name='http_request')
    op.drop_index(op.f('ix_http_request_created'), table_name='http_request')
    op.drop_table('http_request')
