import React from 'react';
import { Dispatch, ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import { ColumnDef } from '@tanstack/react-table';

import {
    Belt,
    SkillDomain,
    SchoolClassStudentBeltsStudentBelts,
    Student,
    User,
} from './api';
import { AdminOnly, LoginContext } from './auth';
import { formatDatetime } from './lib';
import BeltIcon from './BeltIcon';
import SortTable from './SortTable';
import StudentDeleteButton from './StudentDeleteButton';
import StudentEditButton from './StudentEditButton';

interface ActionsProps {
    student: Student;
    setStudents: Dispatch<(prevStudents: Student[]) => Student[]>;
}

function StudentActions_(props: ActionsProps) {
    const { student, setStudents } = props;

    const changedCallback = (nextStudent: Student) =>
        setStudents((prevStudents) => {
            const index = prevStudents.findIndex(
                (otherStudent) => otherStudent.id === nextStudent.id
            );
            if (index === null) {
                return prevStudents;
            }
            const nextStudents = [...prevStudents];
            nextStudents[index] = nextStudent;
            return nextStudents;
        });

    const deletedCallback = (student_id: number) =>
        setStudents((prevStudents) => {
            const index = prevStudents.findIndex(
                (otherStudent) => otherStudent.id === student_id
            );
            if (index === null) {
                return prevStudents;
            }
            const nextStudents = [...prevStudents];
            nextStudents.splice(index, 1);
            return nextStudents;
        });

    return (
        <>
            <StudentEditButton
                student={student}
                changedCallback={changedCallback}
            />{' '}
            <StudentDeleteButton
                student={student}
                deletedCallback={deletedCallback}
            />
        </>
    );
}

const StudentActions = React.memo(StudentActions_);

interface RowProps {
    student: Student;
    setStudents: Dispatch<(prevStudent: Student[]) => Student[]>;
    user: User | undefined;
    this_belts: { belt_id: number; skill_domain_id: number }[];
    sorted_skill_domains: SkillDomain[];
    belt_by_id: { [index: number]: Belt };
}

function EvaluationGridRow_(props: RowProps) {
    const {
        student,
        setStudents,
        user,
        this_belts,
        sorted_skill_domains,
        belt_by_id,
    } = props;
    return (
        <tr key={student.id}>
            <AdminOnly>
                <td>{student.rank}</td>
            </AdminOnly>
            <td>
                <Nav.Link
                    as={Link}
                    to={'/students/' + student.id}
                    disabled={!(user?.is_admin || student.user_id === user?.id)}
                >
                    {student.display_name}
                </Nav.Link>
            </td>
            {sorted_skill_domains.map((skill_domain) => {
                let belt_id = undefined;
                this_belts.forEach(({ belt_id: xbelt_id, skill_domain_id }) => {
                    if (skill_domain_id === skill_domain.id) {
                        belt_id = xbelt_id;
                    }
                });
                if (belt_id === undefined) {
                    return <td key={skill_domain.id}></td>;
                }
                const belt = belt_by_id[belt_id];
                if (belt === undefined) {
                    return <td key={skill_domain.id}></td>;
                }
                return (
                    <td key={skill_domain.id}>
                        <BeltIcon belt={belt} />
                    </td>
                );
            })}
            <AdminOnly>
                <td>
                    {student.last_login
                        ? formatDatetime(student.last_login)
                        : ''}
                </td>
                <td>
                    <StudentActions
                        student={student}
                        setStudents={setStudents}
                    />
                </td>
            </AdminOnly>
        </tr>
    );
}

const EvaluationGridRow = React.memo(EvaluationGridRow_);

interface Props {
    students: Student[];
    setStudents: Dispatch<(prevStudent: Student[]) => Student[]>;
    skill_domains: SkillDomain[];
    belts: Belt[];
    student_belts: SchoolClassStudentBeltsStudentBelts[];
}

export default function EvaluationGrid(props: Props): ReactElement | null {
    const { students, setStudents, skill_domains, belts, student_belts } =
        props;
    const { t } = useTranslation();
    const loginInfo = React.useContext(LoginContext);

    // ensure the logged student is always the first on in the list
    if (loginInfo?.user?.is_admin === false) {
        students.sort((a, b) => {
            if (a.display_name === loginInfo.student?.display_name) {
                return -1;
            }
            if (b.display_name === loginInfo.student?.display_name) {
                return +1;
            }
            return a.display_name.localeCompare(b.display_name);
        });
    }

    const sorted_skill_domains = useMemo(
        () => skill_domains.sort((a, b) => a.code.localeCompare(b.code)),
        [skill_domains]
    );

    const { columns: columnsMemo, sorting: sortingMemo } = useMemo(() => {
        if (!loginInfo) {
            return { columns: [], sorting: [] };
        }

        const columns: ColumnDef<Student>[] = [
            {
                id: 'display_name',
                accessorKey: 'display_name',
                header: t('student.list.display_name.title'),
            },
        ];
        sorted_skill_domains.forEach((skill_domain) =>
            columns.push({
                id: skill_domain.name,
                header: skill_domain.name,
            })
        );

        const sorting = [];

        if (loginInfo.user.is_admin) {
            sorting.push({
                id: 'rank',
                desc: false,
            });
            sorting.push({
                id: 'display_name',
                desc: false,
            });
            columns.unshift({
                id: 'rank',
                header: t('student.list.rank.title'),
                accessorKey: 'rank',
            });
            columns.push({
                id: 'last_login',
                header: t('student.list.last_login.title'),
            });
            columns.push({
                id: 'actions',
                header: t('student.list.actions.title'),
            });
        }

        return { columns, sorting };
    }, [loginInfo, sorted_skill_domains, t]);

    const rowComponent = useMemo(() => {
        const user = loginInfo?.user;
        const belt_by_id = Object.fromEntries(
            belts.map((belt) => [belt.id, belt])
        );
        const student_belts_by_student_id = Object.fromEntries(
            student_belts.map(({ student_id, belts: xbelts }) => [
                student_id,
                xbelts,
            ])
        );
        function RowComponent(student: Student) {
            const this_belts = student_belts_by_student_id[student.id];
            if (!this_belts) {
                return null;
            }
            return (
                <EvaluationGridRow
                    key={student.id}
                    student={student}
                    setStudents={setStudents}
                    user={user}
                    this_belts={this_belts}
                    sorted_skill_domains={sorted_skill_domains}
                    belt_by_id={belt_by_id}
                />
            );
        }
        return RowComponent;
    }, [belts, loginInfo, setStudents, sorted_skill_domains, student_belts]);

    return (
        <SortTable
            data={students}
            columns={columnsMemo}
            initialSorting={sortingMemo}
            rowComponent={rowComponent}
        />
    );
}
