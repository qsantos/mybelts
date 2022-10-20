import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';

import { BeltIcon } from './belt';
import {
    ClassLevel,
    SchoolClass,
    Student, StudentsService,
    Evaluation, SkillDomain, Belt,
    WaitlistEntry, WaitlistService
}  from './api';
import { ModalButton } from './modal-button';

interface CreateStudentButtonProps {
    school_class: SchoolClass;
    class_level: ClassLevel;
    createdCallback?: (student: Student) => void;
}

export function CreateStudentButton(props : CreateStudentButtonProps): ReactElement {
    const { school_class, class_level, createdCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="student.add"
            i18nArgs={{ class_level, school_class }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    display_name: {value: string};
                    username: {value: string};
                    password: {value: string};
                    can_register_to_waitlist: {checked: boolean};
                };
                return StudentsService.postStudentsResource({
                    school_class_id: school_class.id,
                    display_name: typed_form.display_name.value,
                    username: typed_form.username.value,
                    password: typed_form.password.value,
                    can_register_to_waitlist: typed_form.can_register_to_waitlist.checked,
                });
            }}
            onResponse={({ student }) => createdCallback?.(student)}
        >
            <Form.Group controlId="display_name">
                <Form.Label>{t('student.add_edit.display_name.title')}</Form.Label>
                <Form.Control type="text" placeholder={t('student.add_edit.display_name.placeholder')} />
                <Form.Text className="text-muted">
                    {t('student.add_edit.display_name.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="can_register_to_waitlist">
                <Form.Check label={t('student.add_edit.can_register_to_waitlist.title')} />
                <Form.Text className="text-muted">
                    {t('student.add_edit.can_register_to_waitlist.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="username">
                <Form.Label>{t('student.add_edit.username.title')}</Form.Label>
                <Form.Control type="text" placeholder={t('student.add_edit.username.placeholder')} />
                <Form.Text className="text-muted">
                    {t('student.add_edit.username.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="password">
                <Form.Label>{t('student.add_edit.password.title')}</Form.Label>
                <Form.Control type="password" />
                <Form.Text className="text-muted">
                    {t('student.add_edit.password.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}

interface EditStudentButtonProps {
    student: Student;
    changedCallback?: (changed_student: Student) => void
}

export function EditStudentButton(props : EditStudentButtonProps): ReactElement {
    const { student, changedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            i18nPrefix="student.edit"
            i18nArgs={{ student }}
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    display_name: {value: string};
                    username: {value: string};
                    password: {value: string};
                    rank: {value: string};
                    can_register_to_waitlist: {checked: boolean};
                };
                return StudentsService.putStudentResource(student.id, {
                    display_name: typed_form.display_name.value,
                    rank: parseInt(typed_form.rank.value),
                    username: typed_form.username.value,
                    password: typed_form.password.value,
                    can_register_to_waitlist: typed_form.can_register_to_waitlist.checked,
                });
            }}
            onResponse={({ student: changed_student }) => changedCallback?.(changed_student)}
        >
            <Form.Group controlId="display_name">
                <Form.Label>{t('student.add_edit.display_name.title')}</Form.Label>
                <Form.Control type="text" placeholder={t('student.add_edit.display_name.placeholder')} defaultValue={student.display_name} />
                <Form.Text className="text-muted">
                    {t('student.add_edit.display_name.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="can_register_to_waitlist">
                <Form.Check label={t('student.add_edit.can_register_to_waitlist.title')} defaultChecked={student.can_register_to_waitlist} />
                <Form.Text className="text-muted">
                    {t('student.add_edit.can_register_to_waitlist.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="rank">
                <Form.Label>{t('student.add_edit.rank.title')}</Form.Label>
                <Form.Control type="number" placeholder={t('student.add_edit.rank.placeholder')} defaultValue={student.rank} />
                <Form.Text className="text-muted">
                    {t('student.add_edit.rank.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="username">
                <Form.Label>{t('student.add_edit.username.title')}</Form.Label>
                <Form.Control type="text" placeholder={t('student.add_edit.username.placeholder')} defaultValue={student.username} />
                <Form.Text className="text-muted">
                    {t('student.add_edit.username.help')}
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="password">
                <Form.Label>{t('student.add_edit.password.title')}</Form.Label>
                <Form.Control type="password" />
                <Form.Text className="text-muted">
                    {t('student.add_edit.password.help')}
                </Form.Text>
            </Form.Group>
        </ModalButton>
    );
}

interface DeleteStudentButtonProps {
    student: Student;
    deletedCallback?: () => void;
}

export function DeleteStudentButton(props : DeleteStudentButtonProps): ReactElement {
    const { student, deletedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="student.delete"
            i18nArgs={{ student }}
            onSubmit={() => StudentsService.deleteStudentResource(student.id)}
            onResponse={() => deletedCallback?.()}
        >
            {t('student.delete.message', { student })}
        </ModalButton>
    );
}

interface UpdateStudentRanksProps {
    students: Student[],
    changedCallback?: (changed_students: Student[]) => void
}

export function UpdateStudentRanks(props: UpdateStudentRanksProps): ReactElement {
    const { students, changedCallback } = props;

    return (
        <ModalButton
            i18nPrefix="student.update_ranks"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    rank: HTMLInputElement[];
                };
                const inputElements = [...typed_form.rank];
                const new_student_ranks = inputElements.map((inputElement: HTMLInputElement) => {
                    return {
                        id: parseInt(inputElement.getAttribute('data-student-id') || '0'),
                        rank: parseInt(inputElement.value || '0'),
                    };
                });
                return StudentsService.putStudentsResource({
                    students: new_student_ranks,
                });
            }}
            onResponse={({ students: changed_students }) => changedCallback?.(changed_students)}
        >
            {students.map(student =>
                <Form.Group controlId="rank" key={student.id} className="mb-3">
                    <Form.Label>{student.display_name}</Form.Label>
                    <Form.Control
                        type="number"
                        defaultValue={student.rank}
                        data-student-id={student.id}
                    />
                </Form.Group>
            )}
        </ModalButton>
    );
}

interface AddToWaitlistButtonProps {
    student: Student,
    skill_domain: SkillDomain,
    belt: Belt,
    addedCallback: (waitlist_entry: WaitlistEntry) => void,
}

export function AddToWaitlistButton(props: AddToWaitlistButtonProps): ReactElement {
    const { student, skill_domain, belt, addedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="success"
            i18nPrefix="student.waitlist.add"
            i18nArgs={{ student, skill_domain, belt }}
            onSubmit={() => StudentsService.postStudentWaitlistResource(student.id, {
                skill_domain_id: skill_domain.id,
                belt_id: belt.id,
            })}
            onResponse={({ waitlist_entry }) => addedCallback(waitlist_entry)}
        >
            {t('student.waitlist.add.message', {
                student: student.display_name,
                belt: belt.name.toLowerCase(),
                skill_domain: skill_domain.name.toLowerCase(),
            })}
            <br />
            <br />
            <BeltIcon belt={belt} />
            {' '}
            <strong>{skill_domain.name}</strong>
        </ModalButton>
    );
}

interface RemoveFromWaitlistButtonProps {
    student: Student,
    skill_domain: SkillDomain,
    belt: Belt,
    waitlist_entry: WaitlistEntry,
    removedCallback: () => void,
}

export function RemoveFromWaitlistButton(props: RemoveFromWaitlistButtonProps): ReactElement {
    const { student, skill_domain, belt, waitlist_entry, removedCallback } = props;
    const { t } = useTranslation();

    return (
        <ModalButton
            variant="danger"
            i18nPrefix="student.waitlist.remove"
            i18nArgs={{ student, skill_domain, belt }}
            onSubmit={() => WaitlistService.deleteWaitlistResource(waitlist_entry.id)}
            onResponse={() => removedCallback?.()}
        >
            {t('student.waitlist.remove.message', {
                student: student.display_name,
                belt: belt.name.toLowerCase(),
                skill_domain: skill_domain.name.toLowerCase(),
            })}
            <br />
            <br />
            <BeltIcon belt={belt} />
            {' '}
            <strong>{skill_domain.name}</strong>
        </ModalButton>
    );
}

interface StudentBeltsProps {
    skill_domains: SkillDomain[],
    belts: Belt[],
    student: Student,
    evaluations: Evaluation[],
    canUseWaitlist: boolean,
    waitlist_entries: WaitlistEntry[],
    setWaitlistEntries: (waitlist_entries: WaitlistEntry[]) => void,
}

export function StudentBelts(props: StudentBeltsProps): ReactElement {
    const {
        skill_domains, belts, student, evaluations,
        canUseWaitlist, waitlist_entries, setWaitlistEntries,
    } = props;
    const { t } = useTranslation();

    const belt_by_id = Object.fromEntries(belts.map(belt => [belt.id, belt]));
    const belt_by_rank = Object.fromEntries(belts.map(belt => [belt.rank, belt]));
    const passed_evaluations = evaluations.filter(evaluation => evaluation.success);

    const waitlist_entries_by_skill_domain: {[index: number]: {
        index: number,
        waitlist_entry: WaitlistEntry,
    }} = {};
    waitlist_entries.forEach(
        (waitlist_entry: WaitlistEntry, index: number) =>
            waitlist_entries_by_skill_domain[waitlist_entry.skill_domain_id] = {index, waitlist_entry}
    );

    const belt_of_skill_domain = (skill_domain: SkillDomain) => {
        const domain_evaluations = passed_evaluations.filter(evaluation => evaluation.skill_domain_id === skill_domain.id);
        if (domain_evaluations.length === 0) {
            // no successful evaluation yet
            const belt = belts[0];
            if (belt === undefined) {
                // should not happen
                console.error('no belt found');
                return null;
            }
            return null;
        }
        const sorted_domain_evaluations = domain_evaluations.sort((a, b) => {
            const belt_a = belt_by_id[a.belt_id];
            if (belt_a === undefined) {
                // should not happen
                console.error('belt ' + belt_a + ' not found');
                return 0;
            }
            const belt_b = belt_by_id[b.belt_id];
            if (belt_b === undefined) {
                // should not happen
                console.error('belt ' + belt_a + ' not found');
                return 0;
            }
            return belt_b.rank - belt_a.rank;
        });
        const best_evaluation = sorted_domain_evaluations[0];
        if (best_evaluation === undefined) {
            // should not happen
            console.error('no belt evaluation found');
            return null;
        }
        const belt_id = best_evaluation.belt_id;
        const belt = belt_by_id[belt_id];
        if (belt === undefined) {
            // should not happen
            console.error('belt ' + belt_id + ' not found');
            return null;
        }
        return belt;
    };

    return (
        <Table>
            <thead>
                <tr>
                    <th>{t('student.belts.skill_domain.title')}</th>
                    <th>{t('student.belts.achieved_belt.title')}</th>
                    {canUseWaitlist &&
                        <th>{t('student.belts.actions.title')}</th>
                    }
                </tr>
            </thead>
            <tbody>
                {skill_domains.map(skill_domain => {
                    const belt = belt_of_skill_domain(skill_domain);
                    if (!canUseWaitlist) {
                        return null;
                    }
                    const next_belt = belt ? belt_by_rank[belt.rank + 1] : belt_by_rank[1];
                    if (!next_belt) {
                        return null;
                    }
                    const index_and_entry = waitlist_entries_by_skill_domain[skill_domain.id];
                    if (index_and_entry) {
                        const { index, waitlist_entry } = index_and_entry;
                        return (
                            <tr key={skill_domain.id} className="skill-domain-on-waitlist">
                                <th>{skill_domain.name}</th>
                                <td>{belt ? <BeltIcon belt={belt} /> : t('student.belts.no_belt')}</td>
                                <td>
                                    <RemoveFromWaitlistButton
                                        student={student}
                                        skill_domain={skill_domain}
                                        belt={next_belt}
                                        waitlist_entry={waitlist_entry}
                                        removedCallback={() => {
                                            const new_waitlist_entries = [...waitlist_entries];
                                            new_waitlist_entries.splice(index, 1);
                                            setWaitlistEntries(new_waitlist_entries);
                                        }}
                                    />
                                </td>
                            </tr>
                        );
                    } else {
                        return (
                            <tr key={skill_domain.id}>
                                <th>{skill_domain.name}</th>
                                <td>{belt ? <BeltIcon belt={belt} /> : t('student.belts.no_belt')}</td>
                                <td>
                                    <AddToWaitlistButton
                                        student={student}
                                        skill_domain={skill_domain}
                                        belt={next_belt}
                                        addedCallback={new_waitlist_entry => {
                                            setWaitlistEntries([...waitlist_entries, new_waitlist_entry]);
                                        }}
                                    />
                                </td>
                            </tr>
                        );
                    }
                })}
            </tbody>
        </Table>
    );
}
