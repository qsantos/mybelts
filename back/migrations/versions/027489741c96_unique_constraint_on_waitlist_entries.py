from alembic import op

revision = '027489741c96'
down_revision = '61da631eca13'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_unique_constraint(
        'waitlist_entry_student_skill_domain',
        'waitlist_entry',
        ['student_id', 'skill_domain_id'],
    )


def downgrade() -> None:
    op.drop_constraint(
        'waitlist_entry_student_skill_domain',
        'waitlist_entry',
        type_='unique',
    )
