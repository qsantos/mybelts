import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';

import { BeltIcon } from './belt';
import {
    Student, StudentsService,
    Evaluation, SkillDomain, Belt,
    WaitlistEntry, WaitlistService
}  from './api';
import { getAPIError } from './lib';

interface CreateStudentButtonProps {
    school_class_id: number;
    createdCallback?: (student: Student) => void;
}

export function CreateStudentButton(props : CreateStudentButtonProps): ReactElement {
    const { school_class_id, createdCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [creating, setCreating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreating(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            display_name: {value: string};
            username: {value: string};
            password: {value: string};
        };
        StudentsService.postStudentsResource({
            school_class_id: school_class_id,
            display_name: target.display_name.value,
            username: target.username.value,
            password: target.password.value,
        }).then(({ student }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(student);
            }
        }).catch(error => {
            setCreating(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('student.add.button.tooltip')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>{t('student.add.button')}</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('student.add.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="display_name">
                        <Form.Label>{t('student.add_edit.display_name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('student.add_edit.display_name.placeholder')}/>
                        <Form.Text className="text-muted">
                            {t('student.add_edit.display_name.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="username">
                        <Form.Label>{t('student.add_edit.username.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('student.add_edit.username.placeholder')}/>
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('student.add.cancel')}</Button>
                    {creating
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('student.add.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('student.add.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface EditStudentButtonProps {
    student: Student;
    changedCallback?: (changed_student: Student) => void
}

export function EditStudentButton(props : EditStudentButtonProps): ReactElement {
    const { student, changedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            display_name: {value: string};
            username: {value: string};
            password: {value: string};
            rank: {value: string};
        };
        StudentsService.putStudentResource(student.id, {
            display_name: target.display_name.value,
            rank: parseInt(target.rank.value),
            username: target.username.value,
            password: target.password.value,
        }).then(({ student: changed_student }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_student);
            }
        }).catch(error => {
            setChanging(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('student.edit.button')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('student.edit.title')}: {student.display_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="display_name">
                        <Form.Label>{t('student.add_edit.display_name.title')}</Form.Label>
                        <Form.Control type="text" placeholder={t('student.add_edit.display_name.placeholder')} defaultValue={student.display_name} />
                        <Form.Text className="text-muted">
                            {t('student.add_edit.display_name.help')}
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('student.edit.cancel')}</Button>
                    {changing
                        ? <Button type="submit" disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('student.edit.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('student.edit.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface DeleteStudentButtonProps {
    student: Student;
    deletedCallback?: () => void;
}

export function DeleteStudentButton(props : DeleteStudentButtonProps): ReactElement {
    const { student, deletedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        StudentsService.deleteStudentResource(student.id).then(() => {
            setShow(false);
            setDeleting(false);
            if (deletedCallback !== undefined ){
                deletedCallback();
            }
        }).catch(error => {
            setDeleting(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('student.delete.button')}</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>{t('student.delete.title')}: {student.display_name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                {t('student.delete.message')}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>{t('student.delete.cancel')}</Button>
                {deleting
                    ? <Button disabled variant="danger">
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">{t('student.delete.in_process')}</span>
                        </Spinner>
                    </Button>
                    : <Button variant="danger" onClick={handleDelete}>{t('student.delete.confirm')}</Button>
                }
            </Modal.Footer>
        </Modal>
    </>;
}

interface UpdateStudentRanksProps {
    students: Student[],
    changedCallback?: (changed_students: Student[]) => void
}

export function UpdateStudentRanks(props: UpdateStudentRanksProps): ReactElement {
    const { students, changedCallback } = props;
    const { t } = useTranslation();

    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [updating, setUpdating] = useState(false);

    const firstElementRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        const element = firstElementRef.current;
        if (element !== null) {
            element.focus();
        }
    }, [show]);

    function handleSubmit(event: FormEvent) {
        setUpdating(true);
        const target = event.target as typeof event.target & {
            rank: HTMLInputElement[];
        };
        const inputElements = [...target.rank];
        const new_student_ranks = inputElements.map((inputElement: HTMLInputElement) => {
            return {
                id: parseInt(inputElement.getAttribute('data-student-id') || '0'),
                rank: parseInt(inputElement.value || '0'),
            };
        });
        const updates = {
            students: new_student_ranks,
        };
        StudentsService.putStudentsResource(updates).then(({ students: changed_students }) => {
            setShow(false);
            setUpdating(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_students);
            }
        }).catch(error => {
            setUpdating(false);
            setErrorMessage(getAPIError(error));
        });
        event.preventDefault();
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('student.update_ranks.button.tooltip')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>{t('student.update_ranks.button')}</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('student.update_ranks.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    {students.map((student, index) =>
                        <Form.Group controlId="rank" key={student.id} className="mb-3">
                            <Form.Label>{student.display_name}</Form.Label>
                            <Form.Control
                                type="number"
                                defaultValue={student.rank}
                                onFocus={event => event.target.select()}
                                ref={index == 0 ? firstElementRef : null}
                                data-student-id={student.id}
                            />
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('student.update_ranks.cancel')}</Button>
                    {updating
                        ? <Button disabled variant="danger">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('student.update_ranks.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('student.update_ranks.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
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

    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [updating, setUpdating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setUpdating(true);
        StudentsService.postStudentWaitlistResource(student.id, {
            skill_domain_id: skill_domain.id,
            belt_id: belt.id,
        }).then(({ waitlist_entry }) => {
            setShow(false);
            setUpdating(false);
            if (addedCallback !== undefined) {
                addedCallback(waitlist_entry);
            }
        }).catch(error => {
            setUpdating(false);
            setErrorMessage(getAPIError(error));
        });
        event.preventDefault();
    }


    return <>
        <OverlayTrigger overlay={<Tooltip>{t('student.waitlist.add.button.tooltip')}</Tooltip>}>
            <Button variant="success" onClick={() => setShow(true)}>
                <img src="/evaluation.png" height="30" />
            </Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('student.waitlist.add.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('student.waitlist.add.cancel')}</Button>
                    {updating
                        ? <Button disabled variant="danger">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('student.waitlist.add.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('student.waitlist.add.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
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

    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [updating, setUpdating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setUpdating(true);
        WaitlistService.deleteWaitlistResource(waitlist_entry.id).then(() => {
            setShow(false);
            setUpdating(false);
            if (removedCallback !== undefined) {
                removedCallback();
            }
        }).catch(error => {
            setUpdating(false);
            setErrorMessage(getAPIError(error));
        });
        event.preventDefault();
    }


    return <>
        <OverlayTrigger overlay={<Tooltip>{t('student.waitlist.remove.button.tooltip')}</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>
                <img src="/evaluation.png" height="30" />
            </Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('student.waitlist.remove.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('student.waitlist.remove.cancel')}</Button>
                    {updating
                        ? <Button disabled variant="danger">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('student.waitlist.remove.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('student.waitlist.remove.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
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
        const domain_evaluations = passed_evaluations.filter(evaluation => evaluation.skill_domain_id == skill_domain.id);
        if (domain_evaluations.length == 0) {
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
                    return (
                        <tr key={skill_domain.id}>
                            <th>{skill_domain.name}</th>
                            <td>{belt ? <BeltIcon belt={belt} /> : t('student.belts.no_belt')}</td>
                            {function(){
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
                                    return <td>
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
                                    </td>;
                                } else {
                                    return <td>
                                        <AddToWaitlistButton
                                            student={student}
                                            skill_domain={skill_domain}
                                            belt={next_belt}
                                            addedCallback={new_waitlist_entry => {
                                                setWaitlistEntries([...waitlist_entries, new_waitlist_entry]);
                                            }}
                                        />
                                    </td>;
                                }
                            }()}
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
}
