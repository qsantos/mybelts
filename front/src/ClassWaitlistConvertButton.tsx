import React from 'react';
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

import {
    Belt,
    SkillDomain,
    Student,
    WaitlistEntry,
    WaitlistService,
} from './api';
import BeltIcon from './BeltIcon';
import ModalButton from './ModalButton';

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
                ({ id, skill_domain_id, belt_id }, index) => {
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
                                    id="completed"
                                    className="big-checkbox"
                                    defaultChecked
                                    onChange={onChange}
                                />
                            </td>
                            <td>
                                <input
                                    type="date"
                                    id="date"
                                    defaultValue={new Date()
                                        .toISOString()
                                        .slice(0, 10)}
                                />
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    id="success"
                                    className="big-checkbox"
                                />
                            </td>
                        </tr>
                    );
                }
            )}
        </>
    );
}

interface Props {
    belt_by_id: { [index: number]: Belt };
    skill_domain_by_id: { [index: number]: SkillDomain };
    student_by_id: { [index: number]: Student };
    sorted_waitlists: [number, WaitlistEntry[]][];
}

export default function ClassWaitlistConvertButton(
    props: Props
): ReactElement {
    const { belt_by_id, skill_domain_by_id, student_by_id, sorted_waitlists } =
        props;

    const { t } = useTranslation();
    const navigate = useNavigate();

    function getCompletedCheckboxes(toggle: HTMLElement): HTMLInputElement[] {
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
            completed: HTMLInputElement[];
        };
        return Array.from(typed_form.completed).filter(checkbox => checkbox.type !== 'hidden');
    }

    function toggleAllCompleted(event: React.ChangeEvent<HTMLInputElement>) {
        const completed = getCompletedCheckboxes(event.target);
        completed.forEach(checkbox => checkbox.checked = event.target.checked);
    }

    function updateToggleAllCompleted() {
        const toggle = document.getElementById("toggleAll-completed") as HTMLInputElement | null;
        if (!toggle) {
            console.error('Did not find completed toggle');
            return;
        }
        const completed = getCompletedCheckboxes(toggle);
        if (completed.every(checkbox => checkbox.checked)) {
            toggle.checked = true;
            toggle.indeterminate = false;
        } else if (!completed.some(checkbox => checkbox.checked)) {
            toggle.checked = false;
            toggle.indeterminate = false;
        } else {
            toggle.indeterminate = true;
        }
    }

    return (
        <ModalButton
            size="lg"
            i18nPrefix="waitlist.convert"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    waitlist_entry_id: HTMLInputElement[];
                    completed: HTMLInputElement[];
                    date: HTMLInputElement[];
                    success: HTMLInputElement[];
                };
                const completed_evaluations = [];
                // the index 0 of these variable is a DUMMY ENTRY
                for (let i = 1; i < typed_form.waitlist_entry_id.length; i++) {
                    const waitlist_entry_id =
                        typed_form.waitlist_entry_id[i]?.value;
                    const completed = typed_form.completed[i]?.checked;
                    const date = typed_form.date[i]?.value;
                    const success = typed_form.success[i]?.checked;
                    if (
                        !waitlist_entry_id ||
                        !completed ||
                        !date ||
                        success === undefined
                    ) {
                        continue;
                    }
                    completed_evaluations.push({
                        waitlist_entry_id: parseInt(waitlist_entry_id),
                        date,
                        success,
                    });
                }
                return WaitlistService.postWaitlistConvertResource({
                    completed_evaluations,
                });
            }}
            onResponse={() => navigate(0)}
        >
            <Form.Group>
                <Form.Label>
                    {t('waitlist.convert.common_date.title')}
                </Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => {
                        const date = event.target.value;
                        const modalBody = event.target?.parentNode?.parentNode;
                        modalBody
                            ?.querySelectorAll('#date')
                            ?.forEach(
                                (input) =>
                                    ((input as HTMLInputElement).value = date)
                            );
                    }}
                />
                <Form.Text className="text-muted">
                    {t('waitlist.convert.common_date.help')}
                </Form.Text>
            </Form.Group>
            {/* ensure the fields are always arrays, even with a single waitlist_entry *}
            {/* BEGIN DUMMY ENTRY  */}
            <input type="hidden" id="waitlist_entry_id" />
            <input type="hidden" id="completed" />
            <input type="hidden" id="date" />
            <input type="hidden" id="success" />
            {/* END DUMMY ENTRY */}
            <Table>
                <thead>
                    <tr>
                        <th>{t('waitlist.convert.columns.student')}</th>
                        <th>{t('waitlist.convert.columns.skill_domain')}</th>
                        <th>{t('waitlist.convert.columns.belt')}</th>
                        <th>
                            <label>
                                <input type="checkbox" defaultChecked id="toggleAll-completed" onChange={toggleAllCompleted} />
                                {' '}
                                {t('waitlist.convert.columns.completed')}
                            </label>
                        </th>
                        <th>{t('waitlist.convert.columns.date')}</th>
                        <th>{t('waitlist.convert.columns.success')}</th>
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
                                    onChange={updateToggleAllCompleted}
                                />
                            );
                        }
                    )}
                </tbody>
            </Table>
        </ModalButton>
    );
}
