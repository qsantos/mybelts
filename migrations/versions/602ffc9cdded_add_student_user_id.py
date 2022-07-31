import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '602ffc9cdded'
down_revision = '98ab794f44c0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('student', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_unique_constraint('student_user_id_is_unique', 'student', ['user_id'])
    op.create_foreign_key('student_user_id_is_foreign_key', 'student', 'user', ['user_id'], ['id'], ondelete='CASCADE')


def downgrade() -> None:
    op.drop_constraint('student_user_id_is_foreign_key', 'student', type_='foreignkey')
    op.drop_constraint('student_user_id_is_unique', 'student', type_='unique')
    op.drop_column('student', 'user_id')
