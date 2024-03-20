import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Table from 'react-bootstrap/Table';

import {
    Belt,
    Class,
    ClassesService,
    SkillDomain,
    Student,
    WaitlistEntry,
} from './api';
import BeltIcon from './BeltIcon';
import ModalButton from './ModalButton';
import RelativeTime from './RelativeTime';

interface StudentRowsProps {
    belt_by_id: { [index: number]: Belt };
    skill_domain_by_id: { [index: number]: SkillDomain };
    student: Student;
    student_waitlist_entries: WaitlistEntry[];
    onChange: () => void;
}

function StudentRows(props: StudentRowsProps) {
    const {
        belt_by_id,
        skill_domain_by_id,
        student,
        student_waitlist_entries,
        onChange,
    } = props;
    const student_id = student.id;
    return (
        <>
            {student_waitlist_entries.map(
                ({ id, skill_domain_id, belt_id, last_printed }, index) => {
                    const skill_domain = skill_domain_by_id[skill_domain_id];
                    if (skill_domain === undefined) {
                        console.error(
                            'skill domain ' + skill_domain_id + ' not found'
                        );
                        return null;
                    }
                    const belt = belt_by_id[belt_id];
                    if (belt === undefined) {
                        console.error('belt ' + belt_id + ' not found');
                        return null;
                    }
                    return (
                        <tr
                            key={[
                                student_id,
                                skill_domain_id,
                                belt_id,
                            ].toString()}
                        >
                            {index === 0 && (
                                <th rowSpan={student_waitlist_entries.length}>
                                    {student.display_name}
                                </th>
                            )}
                            <td>{skill_domain.name}</td>
                            <td>
                                <BeltIcon belt={belt} height={20} />
                            </td>
                            <td>
                                <input
                                    type="hidden"
                                    id="waitlist_entry_id"
                                    value={id}
                                />
                                <input
                                    type="checkbox"
                                    id="print"
                                    className="big-checkbox"
                                    defaultChecked={!last_printed}
                                    onChange={onChange}
                                />
                            </td>
                            <td>
                                {last_printed
                                    ? <RelativeTime dateTime={last_printed} />
                                    : '-'
                                }
                            </td>
                        </tr>
                    );
                }
            )}
        </>
    );
}

interface Props {
    class: Class;
    belt_by_id: { [index: number]: Belt };
    skill_domain_by_id: { [index: number]: SkillDomain };
    student_by_id: { [index: number]: Student };
    sorted_waitlists: [number, WaitlistEntry[]][];
}

export default function ClassExamsPDFButton(props: Props): ReactElement {
    const { class: class_, belt_by_id, skill_domain_by_id, student_by_id, sorted_waitlists } = props;
    const { t } = useTranslation();

    function getPrintCheckboxes(toggle: HTMLElement): HTMLInputElement[] {
        let element = toggle;
        while (element.tagName !== "FORM") {
            const parent = element.parentElement;
            if (!parent) {
                console.error('Could not find form');
                return [];
            }
            element = parent;
        }
        const typed_form = element as typeof element & {
            print: HTMLInputElement[];
        };
        return Array.from(typed_form.print).filter(checkbox => checkbox.type !== 'hidden');
    }

    function toggleAllPrint(event: React.ChangeEvent<HTMLInputElement>) {
        const print = getPrintCheckboxes(event.target);
        print.forEach(checkbox => checkbox.checked = event.target.checked);
    }

    function updateToggleAllPrint() {
        const toggle = document.getElementById("toggleAll-print") as HTMLInputElement | null;
        if (!toggle) {
            console.error('Did not find print toggle');
            return;
        }
        const print = getPrintCheckboxes(toggle);
        if (print.every(checkbox => checkbox.checked)) {
            toggle.checked = true;
            toggle.indeterminate = false;
        } else if (!print.some(checkbox => checkbox.checked)) {
            toggle.checked = false;
            toggle.indeterminate = false;
        } else {
            toggle.indeterminate = true;
        }
    }

    return (
        <ModalButton
            size="lg"
            i18nPrefix="waitlist.print"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    waitlist_entry_id: HTMLInputElement[];
                    print: HTMLInputElement[];
                };
                const waitlist_entry_ids = [];
                // the index 0 of these variable is a DUMMY ENTRY
                for (let i = 1; i < typed_form.waitlist_entry_id.length; i++) {
                    const waitlist_entry_id =
                        typed_form.waitlist_entry_id[i]?.value;
                    const print = typed_form.print[i]?.checked;
                    if (!waitlist_entry_id || print === undefined) {
                        continue;
                    }
                    if (print) {
                        waitlist_entry_ids.push(parseInt(waitlist_entry_id));
                    }
                }
                console.log(waitlist_entry_ids);
                return ClassesService.postClassExamPdfResource(
                    class_.id,
                    {
                        waitlist_entry_ids,
                    },
                );
            }}
            onResponse={(blob) => {
                const url = URL.createObjectURL(blob);
                try {
                    const link = document.createElement(
                        'A'
                    ) as HTMLAnchorElement;
                    link.href = url;
                    link.download = 'exam.pdf';
                    link.click();
                } finally {
                    URL.revokeObjectURL(url);
                }
            }}
        >
            {/* ensure the fields are always arrays, even with a single waitlist_entry *}
            {/* BEGIN DUMMY ENTRY  */}
            <input type="hidden" id="waitlist_entry_id" />
            <input type="hidden" id="print" />
            {/* END DUMMY ENTRY */}
            <Table>
                <thead>
                    <tr>
                        <th>{t('waitlist.print.columns.student')}</th>
                        <th>{t('waitlist.print.columns.skill_domain')}</th>
                        <th>{t('waitlist.print.columns.belt')}</th>
                        <th>
                            <label>
                                <input type="checkbox" defaultChecked id="toggleAll-print" onChange={toggleAllPrint} />
                                {' '}
                                {t('waitlist.print.columns.print')}
                            </label>
                        </th>
                        <th>{t('waitlist.print.columns.last_printed')}</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted_waitlists.map(
                        ([student_id, student_waitlist_entries]) => {
                            const student = student_by_id[student_id];
                            if (student === undefined) {
                                console.error(
                                    'student ' + student_id + ' not found'
                                );
                                return null;
                            }
                            return (
                                <StudentRows
                                    key={student_id}
                                    belt_by_id={belt_by_id}
                                    skill_domain_by_id={skill_domain_by_id}
                                    student={student}
                                    student_waitlist_entries={
                                        student_waitlist_entries
                                    }
                                    onChange={updateToggleAllPrint}
                                />
                            );
                        }
                    )}
                </tbody>
            </Table>
        </ModalButton>
    );
}
