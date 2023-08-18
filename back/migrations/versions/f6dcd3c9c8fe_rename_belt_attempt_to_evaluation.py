from alembic import op

revision = 'f6dcd3c9c8fe'
down_revision = '4d9ecbad8ffb'
branch_labels = None
depends_on = None


def rename_index(before: str, after: str) -> None:
    op.execute(f'ALTER INDEX {before} RENAME TO {after}')


def rename_constraint(before: str, after: str, suffix: str) -> None:
    op.execute(f'ALTER TABLE {after} RENAME CONSTRAINT {before}_{suffix} TO {after}_{suffix}')


def upgrade() -> None:
    op.rename_table('belt_attempt', 'evaluation')
    op.execute('ALTER SEQUENCE belt_attempt_id_seq RENAME TO evaluation_id_seq')
    rename_index('belt_attempt_pkey', 'evaluation_pkey')
    rename_index('ix_belt_attempt_created', 'ix_evaluation_created')
    rename_index('ix_belt_attempt_date', 'ix_evaluation_date')
    rename_index('ix_belt_attempt_success', 'ix_evaluation_success')
    rename_constraint('belt_attempt', 'evaluation', 'belt_id_fkey')
    rename_constraint('belt_attempt', 'evaluation', 'skill_domain_constraint')
    rename_constraint('belt_attempt', 'evaluation', 'student_id_fkey')


def downgrade() -> None:
    op.rename_table('evaluation', 'belt_attempt')
    op.execute('ALTER SEQUENCE evaluation_id_seq RENAME TO belt_attempt_id_seq')
    rename_index('evaluation_pkey', 'belt_attempt_pkey')
    rename_index('ix_evaluation_created', 'ix_belt_attempt_created')
    rename_index('ix_evaluation_date', 'ix_belt_attempt_date')
    rename_index('ix_evaluation_success', 'ix_belt_attempt_success')
    rename_constraint('evaluation', 'belt_attempt', 'belt_id_fkey')
    rename_constraint('evaluation', 'belt_attempt', 'skill_domain_constraint')
    rename_constraint('evaluation', 'belt_attempt', 'student_id_fkey')
