import React from 'react';
import { FormEvent, ReactElement, useState } from 'react';
import Select from 'react-select';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Belt, SkillDomain, Student, BeltAttempt, BeltAttemptsService } from './api';
import './index.css';

interface CreateBeltAttemptButtonProps {
    student: Student;
    skill_domains: SkillDomain[];
    belts: Belt[];
    createdCallback?: (belt_attmept: BeltAttempt) => void;
}

export function CreateBeltAttemptButton(props : CreateBeltAttemptButtonProps): ReactElement {
    const { student, skill_domains, belts, createdCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
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
        BeltAttemptsService.postBeltAttemptsResource({
            student_id: student.id,
            skill_domain_id: parseInt(target.skill_domain.value),
            belt_id: parseInt(target.belt.value),
            date: target.date.value,
            success: target.success.checked,
        }).then(({ belt_attempt }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(belt_attempt);
            }
        }).catch(error => {
            setCreating(false);
            setErrorMessage(error.body.message);
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
        <Button onClick={() => setShow(true)}>Add</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add Belt Attempt for {student.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="skill_domain">
                        <Form.Label>Skill domain</Form.Label>
                        <Select id="skill_domain" name="skill_domain" options={skill_domain_options} />
                        <Form.Text className="text-muted">
                            What skill domain was tested?
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="belt">
                        <Form.Label>Belt</Form.Label>
                        <Select id="belt" name="belt" options={belt_options} />
                        <Form.Text className="text-muted">
                            What belt did the student attempt?
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="date">
                        <Form.Label>Date</Form.Label>
                        <Form.Control type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                        <Form.Text className="text-muted">
                            What belt did the student attempt?
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="success">
                        <Form.Check label="Passed" />
                        <Form.Text className="text-muted">
                            Did the student pass?
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                    {creating
                        ? <Button disabled type="submit">
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">Creating</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">Add</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface EditBeltAttemptButtonProps {
    belt_attempt: BeltAttempt;
    student: Student,
    skill_domains: SkillDomain[];
    belts: Belt[];
    changedCallback?: (changed_belt_attempt: BeltAttempt) => void;
}

export function EditBeltAttemptButton(props : EditBeltAttemptButtonProps): ReactElement {
    const { belt_attempt, student, skill_domains, belts, changedCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
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
        BeltAttemptsService.putBeltAttemptResource(belt_attempt.id, {
            skill_domain_id: parseInt(target.skill_domain.value),
            belt_id: parseInt(target.belt.value),
            date: target.date.value,
            success: target.success.checked,
        }).then(({ belt_attempt: changed_belt_attempt }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_belt_attempt);
            }
        }).catch(error => {
            setChanging(false);
            setErrorMessage(error.body.message);
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

    const skill_domain_by_id = Object.fromEntries(skill_domains.map(skill_domain => [skill_domain.id, skill_domain]));
    const belt_by_id = Object.fromEntries(belts.map(belt => [belt.id, belt]));

    return <>
        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add Belt Attempt for {student.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                    <Form.Group controlId="skill_domain">
                        <Form.Label>Skill domain</Form.Label>
                        <Select
                            id="skill_domain"
                            name="skill_domain"
                            options={skill_domain_options}
                            defaultValue={{
                                value: belt_attempt.skill_domain_id,
                                label: skill_domain_by_id[belt_attempt.skill_domain_id]!.name,
                            }}
                        />
                        <Form.Text className="text-muted">
                            What skill domain was tested?
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="belt">
                        <Form.Label>Belt</Form.Label>
                        <Select
                            id="belt"
                            name="belt"
                            options={belt_options}
                            defaultValue={{
                                value: belt_attempt.belt_id,
                                label: belt_by_id[belt_attempt.belt_id]!.name,
                            }}
                        />
                        <Form.Text className="text-muted">
                            What belt did the student attempt?
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="date">
                        <Form.Label>Date</Form.Label>
                        <Form.Control type="date" defaultValue={belt_attempt.date} />
                        <Form.Text className="text-muted">
                            What belt did the student attempt?
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="success">
                        <Form.Check label="Passed" defaultChecked={belt_attempt.success} />
                        <Form.Text className="text-muted">
                            Did the student pass?
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                    {changing
                        ? <Button type="submit" disabled>
                            <Spinner animation="border" role="status" size="sm">
                                <span className="visually-hidden">Saving</span>
                            </Spinner>
                        </Button>
                        : <Button type="submit">Save</Button>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    </>;
}

interface DeleteBeltAttemptButtonProps {
    student: Student;
    belt_attempt: BeltAttempt;
    deletedCallback?: () => void;
}

export function DeleteBeltAttemptButton(props : DeleteBeltAttemptButtonProps): ReactElement {
    const { student, belt_attempt, deletedCallback } = props;
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        BeltAttemptsService.deleteBeltAttemptResource(belt_attempt.id).then(() => {
            setShow(false);
            setDeleting(false);
            if (deletedCallback !== undefined ){
                deletedCallback();
            }
        }).catch(error => {
            setDeleting(false);
            setErrorMessage(error.body.message);
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>Delete Belt Attempt of {student.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
                Are you sure you want to delete the belt attempt?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>Cancel</Button>
                {deleting
                    ? <Button disabled variant="danger">
                        <Spinner animation="border" role="status" size="sm">
                            <span className="visually-hidden">Deleting</span>
                        </Spinner>
                    </Button>
                    : <Button variant="danger" onClick={handleDelete}>Delete</Button>
                }
            </Modal.Footer>
        </Modal>
    </>;
}

interface BeltAttemptListingProps {
    skill_domains: SkillDomain[];
    belts: Belt[];
    student: Student;
    belt_attempts: BeltAttempt[];
    setBeltAttempts: (belt_attempts: BeltAttempt[]) => void;
}

export function BeltAttemptListing(props: BeltAttemptListingProps): ReactElement {
    const { skill_domains, belts, student, belt_attempts, setBeltAttempts } = props;

    const skill_domain_by_id = Object.fromEntries(skill_domains.map(skill_domain => [skill_domain.id, skill_domain]));
    const belt_by_id = Object.fromEntries(belts.map(belt => [belt.id, belt]));

    return <>
        <Table>
            <thead>
                <tr>
                    <th>Skill domain</th>
                    <th>Belt</th>
                    <th>Date</th>
                    <th>Passed?</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {belt_attempts.map((belt_attempt, index) => {
                    const skill_domain = skill_domain_by_id[belt_attempt.skill_domain_id];
                    const belt = belt_by_id[belt_attempt.belt_id];
                    return <tr key={belt_attempt.id}>
                        <td>{skill_domain === undefined ? `Unknown skill domain ${belt_attempt.skill_domain_id}` : skill_domain.name}</td>
                        <td>{belt === undefined ? `Unknown belt ${belt_attempt.belt_id}` : belt.name}</td>
                        <td>{belt_attempt.success ? '✅' : '❌'}</td>
                        <td>{belt_attempt.date}</td>
                        <td>
                            <EditBeltAttemptButton belt_attempt={belt_attempt} student={student} skill_domains={skill_domains} belts={belts} changedCallback={new_belt_attempt => {
                                belt_attempts[index] = new_belt_attempt;
                                setBeltAttempts(belt_attempts);
                            }} />
                            {' '}
                            <DeleteBeltAttemptButton belt_attempt={belt_attempt} student={student} deletedCallback={() => {
                                belt_attempts.splice(index, 1);
                                setBeltAttempts(belt_attempts);
                            }} />
                        </td>
                    </tr>;
                })}
            </tbody>
        </Table>
    </>;
}
