import React from 'react';
import {
    Dispatch,
    ReactElement,
    SetStateAction,
    useMemo,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { ColumnDef } from '@tanstack/react-table';

import {
    Belt,
    ClassLevel,
    SchoolClass,
    SchoolClassStudentBeltsStudentBelts,
    SkillDomain,
    Student,
    WaitlistEntry,
    WaitlistMapping,
} from './api';
import SortTable from './SortTable';
import SchoolClassManageWaitlistButton from './SchoolClassManageWaitlistButton';

interface DataRow {
    waitlist_entries: WaitlistEntry[];
    student: Student;
}

interface RowProps {
    student: Student;
    waitlist_entries: WaitlistEntry[];
    this_belts: { belt_id: number; skill_domain_id: number }[];
    sorted_skill_domains: SkillDomain[];
    belt_by_id: { [index: number]: Belt };
    belt_by_rank: { [index: number]: Belt };
    setErrorMessage: Dispatch<SetStateAction<string>>;
    setWaitlistMappings: Dispatch<
        (prevState: WaitlistMapping[]) => WaitlistMapping[]
    >;
}

function WaitlistRow_(props: RowProps) {
    const {
        student,
        this_belts,
        sorted_skill_domains,
        belt_by_id,
        belt_by_rank,
        waitlist_entries,
        setErrorMessage,
        setWaitlistMappings,
    } = props;

    const setWaitlistEntries = (
        setStateAction: (
            prevWaitlistEntries: WaitlistEntry[]
        ) => WaitlistEntry[]
    ) =>
        setWaitlistMappings((prevWaitlistMappings) => {
            const index = prevWaitlistMappings.findIndex(
                (candidate) => candidate.student_id === student.id
            );
            const prevWaitlistMapping = prevWaitlistMappings?.[index];
            if (prevWaitlistMapping === undefined) {
                return prevWaitlistMappings;
            }
            const prevWaitlistEntries = prevWaitlistMapping.waitlist_entries;
            const nextWaitlistEntries = setStateAction(prevWaitlistEntries);
            const nextWaitlistMapping = {
                student_id: student.id,
                waitlist_entries: nextWaitlistEntries,
            };
            const nextWaitlistMappings = [...prevWaitlistMappings];
            nextWaitlistMappings[index] = nextWaitlistMapping;
            return nextWaitlistMappings;
        });

    const waitlist_entry_by_domain = Object.fromEntries(
        waitlist_entries.map((waitlist_entry) => [
            waitlist_entry.skill_domain_id,
            waitlist_entry,
        ])
    );

    const onCreate = (nextWaitlistEntry: WaitlistEntry) =>
        setWaitlistEntries((prevWaitlistEntries) => {
            return [...prevWaitlistEntries, nextWaitlistEntry];
        });

    const onDelete = (waitlist_entry_id: number) =>
        setWaitlistEntries((prevWaitlistEntries) => {
            const index = prevWaitlistEntries.findIndex(
                (candidate) => candidate.id === waitlist_entry_id
            );
            if (index === undefined) {
                return prevWaitlistEntries;
            }
            const nextWaitlistEntries = [...prevWaitlistEntries];
            nextWaitlistEntries.splice(index, 1);
            return nextWaitlistEntries;
        });

    return (
        <tr>
            <td>{student.rank}</td>
            <td>{student.display_name}</td>
            {sorted_skill_domains.map((skill_domain) => {
                let belt_id = undefined;
                if (this_belts !== undefined) {
                    this_belts.forEach(
                        ({ belt_id: xbelt_id, skill_domain_id }) => {
                            if (skill_domain_id === skill_domain.id) {
                                belt_id = xbelt_id;
                            }
                        }
                    );
                }
                const belt = belt_id ? belt_by_id[belt_id] : undefined;
                const next_belt = belt
                    ? belt_by_rank[belt.rank + 1]
                    : belt_by_rank[1];
                if (!next_belt) {
                    return <td key={skill_domain.id}></td>;
                }
                const waitlist_entry =
                    waitlist_entry_by_domain?.[skill_domain.id];
                return (
                    <td key={skill_domain.id}>
                        <SchoolClassManageWaitlistButton
                            student={student}
                            belt={next_belt}
                            skill_domain={skill_domain}
                            waitlist_entry={waitlist_entry}
                            setErrorMessage={setErrorMessage}
                            onCreate={onCreate}
                            onDelete={onDelete}
                        />
                    </td>
                );
            })}
        </tr>
    );
}

const WaitlistRow = React.memo(WaitlistRow_);

interface Props {
    class_level: ClassLevel;
    school_class: SchoolClass;
    students: Student[];
    skill_domains: SkillDomain[];
    belts: Belt[];
    student_belts: SchoolClassStudentBeltsStudentBelts[];
    waitlist_mappings: WaitlistMapping[];
    setWaitlistMappings: Dispatch<
        (prevState: WaitlistMapping[]) => WaitlistMapping[]
    >;
}

export default function SchoolClassManageWaitlist(props: Props): ReactElement {
    const {
        class_level,
        school_class,
        students,
        skill_domains,
        belts,
        student_belts,
        waitlist_mappings,
        setWaitlistMappings,
    } = props;
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');

    const sorted_skill_domains = useMemo(
        () => skill_domains.sort((a, b) => a.code.localeCompare(b.code)),
        [skill_domains]
    );

    const columns = useMemo(() => {
        const ret: ColumnDef<DataRow>[] = [
            {
                id: 'rank',
                accessorFn: (row) => row.student.rank,
                header: t('waitlist.manage.columns.rank'),
            },
            {
                id: 'display_name',
                accessorFn: (row) => row.student.display_name,
                header: t('waitlist.manage.columns.display_name'),
            },
        ];

        sorted_skill_domains.forEach((skill_domain) =>
            ret.push({
                id: skill_domain.name,
                header: skill_domain.name,
            })
        );
        return ret;
    }, [sorted_skill_domains, t]);

    const sorting = useMemo(
        () => [
            {
                id: 'rank',
                desc: false,
            },
            {
                id: 'display_name',
                desc: false,
            },
        ],
        []
    );

    // similar to ModalButton, except no form or cancel/confirm buttons
    const i18nPrefix = 'waitlist.manage';
    const i18nArgs = { class_level, school_class };
    const [show, setShow] = useState(false);

    const waitlist_entries_by_student_id = Object.fromEntries(
        waitlist_mappings.map(({ student_id, waitlist_entries }) => [student_id, waitlist_entries])
    );

    const data = students.map((student) => {
        const waitlist_entries = waitlist_entries_by_student_id[student.id] || [];
        return { student, waitlist_entries };
    });

    const rowComponent = useMemo(() => {
        const belt_by_id = Object.fromEntries(
            belts.map((belt) => [belt.id, belt])
        );
        const belt_by_rank = Object.fromEntries(
            belts.map((belt) => [belt.rank, belt])
        );
        const student_belts_by_student_id = Object.fromEntries(
            student_belts.map(({ student_id, belts: xbelts }) => [
                student_id,
                xbelts,
            ])
        );

        function RowComponent(row: DataRow) {
            const { student, waitlist_entries } = row;

            const this_belts = student_belts_by_student_id[student.id] || [];
            return (
                <WaitlistRow
                    key={student.id}
                    student={student}
                    waitlist_entries={waitlist_entries}
                    this_belts={this_belts}
                    sorted_skill_domains={sorted_skill_domains}
                    belt_by_id={belt_by_id}
                    belt_by_rank={belt_by_rank}
                    setErrorMessage={setErrorMessage}
                    setWaitlistMappings={setWaitlistMappings}
                />
            );
        }
        return RowComponent;
    }, [
        belts,
        setErrorMessage,
        setWaitlistMappings,
        sorted_skill_domains,
        student_belts,
    ]);

    return (
        <>
            <OverlayTrigger
                overlay={
                    <Tooltip>
                        {t(i18nPrefix + '.button.tooltip', i18nArgs)}
                    </Tooltip>
                }
            >
                <Button onClick={() => setShow(true)}>
                    {t(i18nPrefix + '.button', i18nArgs)}
                </Button>
            </OverlayTrigger>
            <Modal
                size="xl"
                show={show}
                onHide={() => setShow(false)}
                scrollable
            >
                <Modal.Header>
                    <Modal.Title>
                        {t(i18nPrefix + '.title', i18nArgs)}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    {errorMessage && (
                        <Alert variant="danger">
                            {t('error')}: {errorMessage}
                        </Alert>
                    )}
                    <SortTable
                        data={data}
                        columns={columns}
                        initialSorting={sorting}
                        rowComponent={rowComponent}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>
                        {t(i18nPrefix + '.close', i18nArgs)}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
