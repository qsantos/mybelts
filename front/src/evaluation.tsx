import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { Link } from 'react-router-dom';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';
import { ColumnDef } from '@tanstack/react-table';

import { Belt, SkillDomain, Student, Evaluation, EvaluationsService, SchoolClassStudentBeltsStudentBelts } from './api';
import { LoginContext, is_admin } from './auth';
import { BeltIcon } from './belt';
import { formatDate, formatDatetime, getAPIError } from './lib';
import { SortTable } from './sort-table';
import { EditStudentButton, DeleteStudentButton } from './student';

interface CreateEvaluationButtonProps {
    student: Student;
    skill_domains: SkillDomain[];
    belts: Belt[];
    createdCallback?: (belt_attmept: Evaluation) => void;
}

export function CreateEvaluationButton(props : CreateEvaluationButtonProps): ReactElement {
    const { student, skill_domains, belts, createdCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [creating, setCreating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreating(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            skill_domain: {value: string};
            belt: {value: string};
            date: {value: string};
            success: {checked: boolean};
        };
        EvaluationsService.postEvaluationsResource({
            student_id: student.id,
            skill_domain_id: parseInt(target.skill_domain.value),
            belt_id: parseInt(target.belt.value),
            date: target.date.value,
            success: target.success.checked,
        }).then(({ evaluation }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(evaluation);
            }
        }).catch(error => {
            setCreating(false);
            setErrorMessage(getAPIError(error));
        });
    }

    const sorted_skill_domains = skill_domains.sort((a, b) => a.name.localeCompare(b.name));
    const sorted_belts = belts.sort((a, b) => a.rank - b.rank);

    const skill_domain_options = sorted_skill_domains.map(skill_domain => ({
        value: skill_domain.id,
        label: skill_domain.name,
    }));

    const belt_options = sorted_belts.map(belt => ({
        value: belt.id,
        label: belt.name,
    }));

    return <>
        <Button onClick={() => setShow(true)}>{t('evaluation.add.button')}</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('evaluation.add.title')} {student.display_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="skill_domain">
                        <Form.Label>{t('evaluation.add_edit.skill_domain.title')}</Form.Label>
                        <Select id="skill_domain" name="skill_domain" options={skill_domain_options} />
                        <Form.Text className="text-muted">
                            {t('evaluation.add_edit.skill_domain.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="belt">
                        <Form.Label>{t('evaluation.add_edit.belt.title')}</Form.Label>
                        <Select id="belt" name="belt" options={belt_options} />
                        <Form.Text className="text-muted">
                            {t('evaluation.add_edit.belt.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="date">
                        <Form.Label>{t('evaluation.add_edit.belt.help')}</Form.Label>
                        <Form.Control type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                        <Form.Text className="text-muted">
                            {t('evaluation.add_edit.belt.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="success">
                        <Form.Check label={t('evaluation.add_edit.passed.title')} />
                        <Form.Text className="text-muted">
                            {t('evaluation.add_edit.passed.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('evaluation.add.cancel')}</Button>
                    {creating
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('evaluation.add.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('evaluation.add.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface Option {
    value: number;
    label: string;
}

interface EditEvaluationButtonProps {
    evaluation: Evaluation;
    student: Student,
    skill_domain: SkillDomain;
    belt: Belt;
    skill_domain_options: Option[];
    belt_options: Option[];
    changedCallback?: (changed_evaluation: Evaluation) => void;
}

export function EditEvaluationButton(props : EditEvaluationButtonProps): ReactElement {
    const { evaluation, student, skill_domain, belt, skill_domain_options, belt_options, changedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            skill_domain: {value: string};
            belt: {value: string};
            date: {value: string};
            success: {checked: boolean};
        };
        EvaluationsService.putEvaluationResource(evaluation.id, {
            skill_domain_id: parseInt(target.skill_domain.value),
            belt_id: parseInt(target.belt.value),
            date: target.date.value,
            success: target.success.checked,
        }).then(({ evaluation: changed_evaluation }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_evaluation);
            }
        }).catch(error => {
            setChanging(false);
            setErrorMessage(getAPIError(error));
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>{t('evaluation.edit.button')}</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>{t('evaluation.edit.title')}: {student.display_name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                    <Form.Group controlId="skill_domain">
                        <Form.Label>{t('evaluation.add_edit.skill_domain.title')}</Form.Label>
                        <Select
                            id="skill_domain"
                            name="skill_domain"
                            options={skill_domain_options}
                            defaultValue={{
                                value: evaluation.skill_domain_id,
                                label: skill_domain.name,
                            }}
                        />
                        <Form.Text className="text-muted">
                            {t('evaluation.add_edit.skill_domain.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="belt">
                        <Form.Label>{t('evaluation.add_edit.belt.title')}</Form.Label>
                        <Select
                            id="belt"
                            name="belt"
                            options={belt_options}
                            defaultValue={{
                                value: evaluation.belt_id,
                                label: belt.name,
                            }}
                        />
                        <Form.Text className="text-muted">
                            {t('evaluation.add_edit.belt.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="date">
                        <Form.Label>{t('evaluation.add_edit.date.title')}</Form.Label>
                        <Form.Control type="date" defaultValue={evaluation.date} />
                        <Form.Text className="text-muted">
                            {t('evaluation.add_edit.date.help')}
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="success">
                        <Form.Check label={t('evaluation.add_edit.passed.title')} defaultChecked={evaluation.success} />
                        <Form.Text className="text-muted">
                            {t('evaluation.add_edit.passed.help')}
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>{t('evaluation.edit.cancel')}</Button>
                    {changing
                        ? <Button type="submit" disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">{t('evaluation.edit.in_process')}</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">{t('evaluation.edit.confirm')}</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface DeleteEvaluationButtonProps {
    student: Student;
    evaluation: Evaluation;
    deletedCallback?: () => void;
}

export function DeleteEvaluationButton(props : DeleteEvaluationButtonProps): ReactElement {
    const { student, evaluation, deletedCallback } = props;
    const { t } = useTranslation();
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        EvaluationsService.deleteEvaluationResource(evaluation.id).then(() => {
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
        <OverlayTrigger overlay={<Tooltip>{t('evaluation.delete.button')}</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>{t('evaluation.delete.title')}: {student.display_name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
                {t('evaluation.delete.message')}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>{t('evaluation.delete.confirm')}</Button>
                {deleting
                    ? <Button disabled variant="danger">
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">{t('evaluation.delete.in_process')}</span>
                        </Spinner>
                    </Button>
                    : <Button variant="danger" onClick={handleDelete}>{t('evaluation.delete.confirm')}</Button>
                }
            </Modal.Footer>
        </Modal>
    </>;
}

interface EvaluationListingProps {
    skill_domains: SkillDomain[];
    belts: Belt[];
    student: Student;
    evaluations: Evaluation[];
    setEvaluations: (evaluations: Evaluation[]) => void;
}

export function EvaluationListing(props: EvaluationListingProps): ReactElement {
    const { skill_domains, belts, student, evaluations, setEvaluations } = props;
    const { t } = useTranslation();

    const skill_domain_by_id = Object.fromEntries(
        skill_domains.map(skill_domain => [skill_domain.id, skill_domain])
    );
    const belt_by_id = Object.fromEntries(
        belts.map(belt => [belt.id, belt])
    );

    const skill_domain_options = skill_domains.map(skill_domain => ({
        value: skill_domain.id,
        label: skill_domain.name,
    }));

    const belt_options = belts.map(belt => ({
        value: belt.id,
        label: belt.name,
    }));

    const columns: ColumnDef<Evaluation>[] = [
        {
            id: 'evaluation',
            header: t('evaluation.list.skill_domain.title'),
            accessorFn: evaluation => {
                const skill_domain_id = evaluation.skill_domain_id;
                const skill_domain = skill_domain_by_id[skill_domain_id];
                if (skill_domain === undefined) {
                    // should not happen
                    console.error('skill_domain ' + skill_domain_id + ' not found for evaluation ' + evaluation.id);
                    return <></>;
                }
                return skill_domain.name;
            }
        },
        {
            id: 'belt',
            header: t('evaluation.list.belt.title'),
            accessorFn: evaluation => {
                const belt_id = evaluation.belt_id;
                const belt = belt_by_id[belt_id];
                if (belt === undefined) {
                    // should not happen
                    console.error('belt ' + belt_id + ' not found for evaluation ' + evaluation.id);
                    return <></>;
                }
                return belt.name;
            },
            cell: info => {
                const evaluation = info.row.original;
                const belt_id = evaluation.belt_id;
                const belt = belt_by_id[belt_id];
                if (belt === undefined) {
                    // should not happen
                    console.error('belt ' + belt_id + ' not found for evaluation ' + evaluation.id);
                    return <></>;
                }
                return <BeltIcon belt={belt} />;
            }
        },
        {
            id: 'date',
            header: t('evaluation.list.date.title'),
            accessorKey: 'date',
            cell: info => formatDate(info.row.original.date),
        },
        {
            id: 'passed',
            header: t('evaluation.list.passed.title'),
            accessorKey: 'success',
            cell: info => info.getValue() ? '✅' : '❌',
        },
    ];

    if (is_admin()) {
        columns.push({
            id: 'actions',
            header: t('evaluation.list.actions.title'),
            cell: info => {
                const evaluation = info.row.original;
                const skill_domain_id = evaluation.skill_domain_id;
                const belt_id = evaluation.belt_id;
                const skill_domain = skill_domain_by_id[evaluation.skill_domain_id];
                const belt = belt_by_id[evaluation.belt_id];
                if (skill_domain === undefined) {
                    // should not happen
                    console.error('skill_domain ' + skill_domain_id + ' not found for evaluation ' + evaluation.id);
                    return <></>;
                }
                if (belt === undefined) {
                    // should not happen
                    console.error('belt ' + belt_id + ' not found for evaluation ' + evaluation.id);
                    return <></>;
                }
                return <>
                    <EditEvaluationButton
                        evaluation={evaluation}
                        student={student}
                        skill_domain={skill_domain}
                        belt={belt}
                        skill_domain_options={skill_domain_options}
                        belt_options={belt_options}
                        changedCallback={new_evaluation => {
                            const new_evaluations = [...evaluations];
                            new_evaluations[info.row.index] = new_evaluation;
                            setEvaluations(new_evaluations);
                        }}
                    />
                    {' '}
                    <DeleteEvaluationButton evaluation={evaluation} student={student} deletedCallback={() => {
                        const new_evaluations = [...evaluations];
                        new_evaluations.splice(info.row.index, 1);
                        setEvaluations(new_evaluations);
                    }} />
                </>;
            },
        });
    }

    return <SortTable data={evaluations} columns={columns} />;
}


interface EvaluationGridProps {
    students: Student[];
    setStudents: (students: Student[]) => void;
    skill_domains: SkillDomain[];
    belts: Belt[];
    student_belts: SchoolClassStudentBeltsStudentBelts[],
}

export function EvaluationGrid(props: EvaluationGridProps): ReactElement {
    const { students, setStudents, skill_domains, belts, student_belts } = props;
    const { t } = useTranslation();
    const loginInfo = React.useContext(LoginContext);
    if (!loginInfo) {
        return <></>;
    }
    const user = loginInfo.user;
    const belt_by_id = Object.fromEntries(belts.map(belt => [belt.id, belt]));
    const student_belts_by_student_id = Object.fromEntries(student_belts.map(
        ({student, belts: xbelts}) => [student.id, xbelts]
    ));

    const columns: ColumnDef<Student>[] = [
        {
            id: 'display_name',
            accessorKey: 'display_name',
            header: t('student.list.display_name.title'),
            cell: info => {
                const student = info.row.original;
                const enabled = user.is_admin || student.user_id == user.id;
                return (
                    <Nav.Link as={Link} to={'/students/' + student.id} disabled={!enabled}>
                        {student.display_name}
                    </Nav.Link>
                );
            },
        },
    ];

    skill_domains.forEach(skill_domain => columns.push({
        id: skill_domain.name,
        header: skill_domain.name,
        cell: info => {
            const student = info.row.original;
            const this_belts = student_belts_by_student_id[student.id];
            if (this_belts === undefined) {
                return '';
            }
            let belt_id = undefined;
            this_belts.forEach(({belt_id: xbelt_id, skill_domain_id}) => {
                if (skill_domain_id == skill_domain.id) {
                    belt_id = xbelt_id;
                }
            });
            if (belt_id === undefined) {
                return '';
            }

            const belt = belt_by_id[belt_id];
            if (belt === undefined) {
                return '';
            }
            return <BeltIcon belt={belt} />;
        },
    }));

    const sorting = [{
        id: 'display_name',
        desc: false,
    }];

    if (is_admin()) {
        sorting[0] = {
            id: 'rank',
            desc: false,
        };
        columns.unshift({
            id: 'rank',
            header: t('student.list.rank.title'),
            accessorKey: 'rank',
        });
        columns.push({
            id: 'last_login',
            header: t('student.list.last_login.title'),
            cell: info => {
                const student = info.row.original;
                return student.last_login ? formatDatetime(student.last_login) : '';
            }
        });
        columns.push({
            id: 'actions',
            header: t('student.list.actions.title'),
            cell: info => {
                const student = info.row.original;
                return <>
                    <EditStudentButton student={student} changedCallback={new_student => {
                        const new_students = [...students];
                        new_students[info.row.index] = new_student;
                        setStudents(new_students);
                    }} />
                    {' '}
                    <DeleteStudentButton student={student} deletedCallback={() => {
                        const new_students = [...students];
                        new_students.splice(info.row.index, 1);
                        setStudents(new_students);
                    }} />
                </>;
            }
        });
    }

    return <SortTable data={students} columns={columns} initialSorting={sorting} />;
}
