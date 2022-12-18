import React from 'react';
import { Dispatch, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import { ColumnDef } from '@tanstack/react-table';

import {
    Belt,
    SkillDomain,
    SchoolClassStudentBeltsStudentBelts,
    Student,
} from './api';
import { LoginContext } from './auth';
import { formatDatetime } from './lib';
import BeltIcon from './BeltIcon';
import SortTable from './SortTable';
import StudentDeleteButton from './StudentDeleteButton';
import StudentEditButton from './StudentEditButton';

interface Props {
    students: Student[];
    setStudents: Dispatch<Student[]>;
    skill_domains: SkillDomain[];
    belts: Belt[];
    student_belts: SchoolClassStudentBeltsStudentBelts[];
}

export default function EvaluationGrid(props: Props): ReactElement | null {
    const { students, setStudents, skill_domains, belts, student_belts } =
        props;
    const { t } = useTranslation();
    const loginInfo = React.useContext(LoginContext);

    const { columns: columnsMemo, sorting: sortingMemo } = React.useMemo(() => {
        if (!loginInfo) {
            return { columns: [], sorting: [] };
        }
        const user = loginInfo.user;
        const belt_by_id = Object.fromEntries(
            belts.map((belt) => [belt.id, belt])
        );
        const student_belts_by_student_id = Object.fromEntries(
            student_belts.map(({ student_id, belts: xbelts }) => [
                student_id,
                xbelts,
            ])
        );

        const columns: ColumnDef<Student>[] = [
            {
                id: 'display_name',
                accessorKey: 'display_name',
                header: t('student.list.display_name.title'),
                cell: (info) => {
                    const student = info.row.original;
                    const enabled =
                        user.is_admin || student.user_id === user.id;
                    return (
                        <Nav.Link
                            as={Link}
                            to={'/students/' + student.id}
                            disabled={!enabled}
                        >
                            {student.display_name}
                        </Nav.Link>
                    );
                },
            },
        ];

        const sorted_skill_domains = skill_domains.sort((a, b) =>
            a.code.localeCompare(b.code)
        );
        sorted_skill_domains.forEach((skill_domain) =>
            columns.push({
                id: skill_domain.name,
                header: skill_domain.name,
                cell: (info) => {
                    const student = info.row.original;
                    const this_belts = student_belts_by_student_id[student.id];
                    if (this_belts === undefined) {
                        return '';
                    }
                    let belt_id = undefined;
                    this_belts.forEach(
                        ({ belt_id: xbelt_id, skill_domain_id }) => {
                            if (skill_domain_id === skill_domain.id) {
                                belt_id = xbelt_id;
                            }
                        }
                    );
                    if (belt_id === undefined) {
                        return '';
                    }

                    const belt = belt_by_id[belt_id];
                    if (belt === undefined) {
                        return '';
                    }
                    return <BeltIcon belt={belt} />;
                },
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
                cell: (info) => {
                    const student = info.row.original;
                    return student.last_login
                        ? formatDatetime(student.last_login)
                        : '';
                },
            });
            columns.push({
                id: 'actions',
                header: t('student.list.actions.title'),
                cell: (info) => {
                    const student = info.row.original;
                    return (
                        <>
                            <StudentEditButton
                                student={student}
                                changedCallback={(new_student) => {
                                    const new_students = [...students];
                                    new_students[info.row.index] = new_student;
                                    setStudents(new_students);
                                }}
                            />{' '}
                            <StudentDeleteButton
                                student={student}
                                deletedCallback={() => {
                                    const new_students = [...students];
                                    new_students.splice(info.row.index, 1);
                                    setStudents(new_students);
                                }}
                            />
                        </>
                    );
                },
            });
        } else {
            // ensure the logged student is always the first on in the list
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

        return { columns, sorting };
    }, [
        belts,
        loginInfo,
        setStudents,
        skill_domains,
        student_belts,
        students,
        t,
    ]);

    return (
        <SortTable
            data={students}
            columns={columnsMemo}
            initialSorting={sortingMemo}
        />
    );
}
