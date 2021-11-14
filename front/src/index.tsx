import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { FormEvent, ReactNode, StrictMode, useEffect, useState } from 'react';

import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
    Belt, BeltList, BeltsService,
    ClassLevel, ClassLevelList, ClassLevelsService,
    SchoolClassList, SchoolClassesService, SchoolClassStudentBelts,
    SkillDomain, SkillDomainList, SkillDomainsService,
    StudentList,
} from './api';
import './index.css';

function BreadcrumbItem({ children, href, active }: { children: ReactNode, href?: string, active?: boolean }) {
    if (href) {
        return <Breadcrumb.Item linkAs={Link} linkProps={{to: href}}>{children}</Breadcrumb.Item>;
    } else {
        return <Breadcrumb.Item active={active === undefined ? false : active}>{children}</Breadcrumb.Item>;
    }
}

function Loader() {
    return <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading</span>
    </Spinner>;
}

function CreateBeltButton({ createdCallback } : { createdCallback?: (belt: Belt) => void }) {
    const [show, setShow] = useState(false);
    const [creating, setCreating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreating(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
        };
        BeltsService.postBeltsResource({
            name: target.name.value,
        }).then(({ belt }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(belt);
            }
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>Add</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add Belt</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: White Belt" />
                        <Form.Text className="text-muted">
                            Name for the new belt
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

interface MoveBeltButtonProps {
    buttonContent: string;
    direction_name: string;
    direction: number;
    belt: Belt;
    belts: Belt[];
    setBeltList: (beltList: BeltList) => void;
}

function MoveBeltButton({ buttonContent, direction_name, direction, belt, belts, setBeltList } : MoveBeltButtonProps) {
    const [moving, setMoving] = useState(false);

    function handleMove() {
        setMoving(true);
        BeltsService.patchBeltRankResource(belt.id, {
            go_up_n_ranks: direction,
        }).then(() => {
            setMoving(false);
            const other_belt = belts[belt.rank + direction - 1];
            if (other_belt === undefined) {
                console.error('Failed to find other belt');
                return;
            }
            // adjust belt list
            [belt.rank, other_belt.rank] = [other_belt.rank, belt.rank];
            belts[belt.rank - 1] = belt;
            belts[other_belt.rank - 1] = other_belt;
            setBeltList({ belts: belts });
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Move {direction_name}</Tooltip>}>
            {moving
                ? <Button disabled>
                    <Spinner animation="border" role="status" size="sm">
                        <span className="visually-hidden">Moving {direction_name}</span>
                    </Spinner>
                </Button>
                : <Button disabled={belt.rank + direction <= 0 || belt.rank + direction > belts.length} onClick={handleMove}>
                    {buttonContent}
                </Button>
            }
        </OverlayTrigger>
    </>;
}

function EditBeltButton({ belt, changedCallback } : { belt: Belt, changedCallback?: (changed_belt: Belt) => void }) {
    const [show, setShow] = useState(false);
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
        };
        BeltsService.putBeltResource(belt.id, {
            name: target.name.value,
        }).then(({ belt: changed_belt }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_belt);
            }
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Edit Belt</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: Algebra" defaultValue={belt.name} />
                        <Form.Text className="text-muted">
                            New name for the belt “{belt.name}”
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

function DeleteBeltButton({ belt, deletedCallback } : { belt: Belt, deletedCallback?: () => void }) {
    const [show, setShow] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        BeltsService.deleteBeltResource(belt.id).then(() => {
            setShow(false);
            setDeleting(false);
            if (deletedCallback !== undefined ){
                deletedCallback();
            }
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>Delete Belt</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the belt “{belt.name}”?
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

function BeltsView() {
    const [beltList, setBeltList] = useState<null | BeltList>(null);

    useEffect(() => {
        BeltsService.getBeltsResource().then(setBeltList);
    }, []);

    if (beltList === null) {
        return <>
            <h3>Belts</h3>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem active href="/belts">Belts</BreadcrumbItem>
            </Breadcrumb>
            <Loader />
        </>;
    }

    const { belts } = beltList;

    const sorted_belts = belts.sort((a, b) => (a.rank - b.rank));
    // TODO: handle case where result is false
    sorted_belts.reduce((previous, belt, index) => {
        if (belt.rank != index + 1) {
            console.error(`Inconsistent ranking of belts ${belt.id}!`);
            return false;
        }
        return previous;
    }, true);

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem active href="/belts">Belts</BreadcrumbItem>
        </Breadcrumb>
        <h3>Belts</h3>
        <CreateBeltButton createdCallback={belt => {
            belts.push(belt);
            setBeltList({ belts: belts });
        }}/>
        <h4>List of available belts</h4>
        <Table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {sorted_belts.map((belt, index) =>
                    <tr key={belt.id}>
                        <td>{belt.rank}</td>
                        <td>{belt.name}</td>
                        <td>
                            <MoveBeltButton buttonContent="↑" direction_name="Up" direction={-1} belt={belt} belts={sorted_belts} setBeltList={setBeltList} />
                            {' '}
                            <MoveBeltButton buttonContent="↓" direction_name="Down" direction={1} belt={belt} belts={sorted_belts} setBeltList={setBeltList} />
                            {' '}
                            <EditBeltButton belt={belt} changedCallback={new_belt => {
                                belts[index] = new_belt;
                                setBeltList({ belts: belts });
                            }} />
                            {' '}
                            <DeleteBeltButton belt={belt} deletedCallback={() => {
                                belts.splice(index, 1);
                                for (let j = index; j < belts.length; j += 1) {
                                    belts[j]!.rank -= 1;
                                }
                                setBeltList({ belts: belts });
                            }} />
                        </td>
                    </tr>)}
            </tbody>
        </Table>
    </>;
}

function CreateSkillDomainButton({ createdCallback } : { createdCallback?: (skill_domain: SkillDomain) => void }) {
    const [show, setShow] = useState(false);
    const [creating, setCreating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreating(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
        };
        SkillDomainsService.postSkillDomainsResource({
            name: target.name.value,
        }).then(({ skill_domain }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(skill_domain);
            }
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>Add</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add Skill Domain</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: Algebra" />
                        <Form.Text className="text-muted">
                            Name for the new skill domain
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

function EditSkillDomainButton({ skill_domain, changedCallback } : { skill_domain: SkillDomain, changedCallback?: (changed_skill_domain: SkillDomain) => void }) {
    const [show, setShow] = useState(false);
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
        };
        SkillDomainsService.putSkillDomainResource(skill_domain.id, {
            name: target.name.value,
        }).then(({ skill_domain: changed_skill_domain }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_skill_domain);
            }
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Edit Skill Domain</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control type="text" placeholder="Example: Algebra" defaultValue={skill_domain.name} />
                        <Form.Text className="text-muted">
                            New name for the skill domain “{skill_domain.name}”
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

function DeleteSkillDomainButton({ skill_domain, deletedCallback } : { skill_domain: SkillDomain, deletedCallback?: () => void }) {
    const [show, setShow] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        SkillDomainsService.deleteSkillDomainResource(skill_domain.id).then(() => {
            setShow(false);
            setDeleting(false);
            if (deletedCallback !== undefined ){
                deletedCallback();
            }
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>Delete Skill Domain</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the skill domain “{skill_domain.name}”?
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

function SkillDomainsView() {
    const [skillDomainList, setSkillDomainList] = useState<null | SkillDomainList>(null);

    useEffect(() => {
        SkillDomainsService.getSkillDomainsResource().then(setSkillDomainList);
    }, []);

    if (skillDomainList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem active href="/skill-domains">Skill Domains</BreadcrumbItem>
            </Breadcrumb>
            <h3>Skill Domains</h3>
            <Loader />
        </>;
    }

    const { skill_domains } = skillDomainList;
    const sorted_skill_domains = skill_domains.sort((a, b) => a.name == b.name ? 0 : a.name < b.name ? - 1 : 1);

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem active href="/skill-domains">Skill Domains</BreadcrumbItem>
        </Breadcrumb>
        <h3>Skill Domains</h3>
        <CreateSkillDomainButton createdCallback={skill_domain => {
            skill_domains.push(skill_domain);
            setSkillDomainList({ skill_domains: skill_domains });
        }}/>
        <h4>List of available skill domains</h4>
        <Table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {sorted_skill_domains.map((skill_domain, index) =>
                    <tr key={skill_domain.id}>
                        <td>{skill_domain.name}</td>
                        <td>
                            <EditSkillDomainButton skill_domain={skill_domain} changedCallback={new_skill_domain => {
                                skill_domains[index] = new_skill_domain;
                                setSkillDomainList({ skill_domains: skill_domains });
                            }} />
                            {' '}
                            <DeleteSkillDomainButton skill_domain={skill_domain} deletedCallback={() => {
                                skill_domains.splice(index, 1);
                                setSkillDomainList({ skill_domains: skill_domains });
                            }} />
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}

function CreateClassLevelButton({ createdCallback } : { createdCallback?: (class_level: ClassLevel) => void }) {
    const [show, setShow] = useState(false);
    const [creating, setCreating] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreating(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            prefix: {value: string};
        };
        ClassLevelsService.postClassLevelsResource({
            prefix: target.prefix.value,
        }).then(({ class_level }) => {
            setShow(false);
            setCreating(false);
            if (createdCallback !== undefined) {
                createdCallback(class_level);
            }
        });
    }

    return <>
        <Button onClick={() => setShow(true)}>Add</Button>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add Class Level</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="prefix">
                        <Form.Label>Prefix</Form.Label>
                        <Form.Control type="text" placeholder="Example: 4e" />
                        <Form.Text className="text-muted">
                            Prefix for the new class level
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

function EditClassLevelButton({ class_level, changedCallback } : { class_level: ClassLevel, changedCallback?: (changed_class_level: ClassLevel) => void }) {
    const [show, setShow] = useState(false);
    const [changing, setChanging] = useState(false);

    function handleSubmit(event: FormEvent) {
        setChanging(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            prefix: {value: string};
        };
        ClassLevelsService.putClassLevelResource(class_level.id, {
            prefix: target.prefix.value,
        }).then(({ class_level: changed_class_level }) => {
            setChanging(false);
            setShow(false);
            if (changedCallback !== undefined) {
                changedCallback(changed_class_level);
            }
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
            <Button onClick={() => setShow(true)}>✏️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Edit Class Level</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="prefix">
                        <Form.Label>Prefix</Form.Label>
                        <Form.Control type="text" placeholder="Example: 4e" defaultValue={class_level.prefix} />
                        <Form.Text className="text-muted">
                            New prefix for the class level “{class_level.prefix}”
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

function DeleteClassLevelButton({ class_level, deletedCallback } : { class_level: ClassLevel, deletedCallback?: () => void }) {
    const [show, setShow] = useState(false);
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        setDeleting(true);
        ClassLevelsService.deleteClassLevelResource(class_level.id).then(() => {
            setShow(false);
            setDeleting(false);
            if (deletedCallback !== undefined ){
                deletedCallback();
            }
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <Button variant="danger" onClick={() => setShow(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={show}>
            <Modal.Header>
                <Modal.Title>Delete Class Level</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the class level “{class_level.prefix}”?
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

function ClassLevelsView() {
    const [classLevelList, setClassLevelList] = useState<null | ClassLevelList>(null);
    const navigate = useNavigate();

    useEffect(() => {
        ClassLevelsService.getClassLevelsResource().then(setClassLevelList);
    }, []);

    if (classLevelList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem active href="/class-levels">Levels</BreadcrumbItem>
            </Breadcrumb>
            <Loader />
        </>;
    }

    const { class_levels } = classLevelList;
    const sorted_class_levels = class_levels.sort((a, b) => a.prefix == b.prefix ? 0 : a.prefix < b.prefix ? -1 : 1);

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem active href="/class-levels">Levels</BreadcrumbItem>
        </Breadcrumb>
        <h3>Class Levels</h3>
        <h3>List of available class levels</h3>
        <CreateClassLevelButton createdCallback={class_level => {
            class_levels.push(class_level);
            setClassLevelList({ class_levels: class_levels });
        }} />
        <Table>
            <thead>
                <tr>
                    <th>Prefix</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {sorted_class_levels.map((class_level, index) =>
                    <tr key={class_level.id}>
                        <td>
                            <Nav.Link as={Link} to={`${class_level.id}`}>
                                {class_level.prefix}
                            </Nav.Link>
                        </td>
                        <td>
                            <Button onClick={() => navigate(`${class_level.id}`)}>🔍</Button>
                            {' '}
                            <EditClassLevelButton class_level={class_level} changedCallback={new_class_level => {
                                class_levels[index] = new_class_level;
                                setClassLevelList({ class_levels: class_levels });
                            }} />
                            {' '}
                            <DeleteClassLevelButton class_level={class_level} deletedCallback={() => {
                                class_levels.splice(index, 1);
                                setClassLevelList({ class_levels: class_levels });
                            }} />
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}

function ClassLevelView() {
    const { class_level_id } = useParams();
    const [schoolClassList, setSchoolClassList] = useState<null | SchoolClassList>(null);

    useEffect(() => {
        ClassLevelsService.getClassLevelSchoolClassesResource(parseInt(class_level_id!)).then(setSchoolClassList);
    }, [class_level_id]);

    if (schoolClassList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
                <BreadcrumbItem active href={`/class-levels/${class_level_id}`}>Level ?</BreadcrumbItem>
            </Breadcrumb>
            <Loader />
        </>;
    }

    const { class_level, school_classes } = schoolClassList;
    const sorted_school_classes = school_classes.sort((a, b) => a.suffix == b.suffix ? 0 : a.suffix < b.suffix ? -1 : 1);

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
            <BreadcrumbItem active href={`/class-levels/${class_level.id}`}>Level {class_level.prefix}</BreadcrumbItem>
        </Breadcrumb>
        <h3>{class_level.prefix}</h3>
        {school_classes.length === 0 ? 'No school class' : <ListGroup>
            {sorted_school_classes.map(school_class =>
                <ListGroup.Item action key={school_class.id}>
                    <Nav.Link as={Link} to={`/school-classes/${school_class.id}`}>
                        {school_class.suffix}
                    </Nav.Link>
                </ListGroup.Item>
            )}
        </ListGroup>}
    </>;
}

function SchoolClassView() {
    const { school_class_id } = useParams();
    const [studentList, setStudentList] = useState<null | StudentList>(null);

    useEffect(() => {
        SchoolClassesService.getSchoolClassResource(parseInt(school_class_id!)).then(setStudentList);
    }, [school_class_id]);

    if (studentList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
                <BreadcrumbItem>Level ?</BreadcrumbItem>
                <BreadcrumbItem active href="/">Class ?</BreadcrumbItem>
            </Breadcrumb>
            <Link to="belts">Belts</Link>
            <br />
            <Loader />
        </>;
    }

    const { class_level, school_class, students } = studentList;

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
            <BreadcrumbItem href={`/class-levels/${class_level.id}`}>Level {class_level.prefix}</BreadcrumbItem>
            <BreadcrumbItem active href={`/school-classes/${school_class.id}`}>Class {school_class.suffix}</BreadcrumbItem>
        </Breadcrumb>
        <Link to="belts">Belts</Link>
        <h3>{class_level.prefix}{school_class.suffix}</h3>
        {students.length === 0 ? 'No students' : <ListGroup>
            {students.map(student =>
                <ListGroup.Item key={student.id}>{student.name}</ListGroup.Item>
            )}
        </ListGroup>}
    </>;
}

function SchoolClassBeltsView() {
    const { school_class_id } = useParams();

    const [schoolClassStudentBelts, setSchoolClassStudentBelts] = useState<null | SchoolClassStudentBelts>(null);

    useEffect(() => {
        SchoolClassesService.getSchoolClassStudentBeltsResource(parseInt(school_class_id!)).then(setSchoolClassStudentBelts);
    }, [school_class_id]);

    if (schoolClassStudentBelts === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
                <BreadcrumbItem>Level ?</BreadcrumbItem>
                <BreadcrumbItem href={`/school-class/${school_class_id}`}>Class ?</BreadcrumbItem>
                <BreadcrumbItem active href={`/school-classes/${school_class_id}/belts`}>Belts</BreadcrumbItem>
            </Breadcrumb>
            <Loader />
        </>;
    }

    const { class_level, school_class, belts, skill_domains, student_belts } = schoolClassStudentBelts;
    if (student_belts.length === 0) {
        return <>No student in this class</>;
    }
    const belt_by_id = Object.fromEntries(belts.map(belt => [belt.id, belt]));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
            <BreadcrumbItem href={`/class-levels/${class_level.id}`}>Level {class_level.prefix}</BreadcrumbItem>
            <BreadcrumbItem active href={`/school-classes/${school_class.id}`}>Class {school_class.suffix}</BreadcrumbItem>
            <BreadcrumbItem active href={`/school-classes/${school_class.id}/belts`}>Belts</BreadcrumbItem>
        </Breadcrumb>
        <h3>{class_level.prefix}{school_class.suffix} belts</h3>
        <Table>
            <thead>
                <tr>
                    <th>Student</th>
                    {skill_domains.map(skill_domain => <th key={skill_domain.id}>{skill_domain.name}</th>)}
                </tr>
            </thead>
            <tbody>
                {student_belts.map(({student, belts: skill_belt_ids}) => {
                    const belt_id_by_skill_domain_id = Object.fromEntries(skill_belt_ids.map(({skill_domain_id, belt_id}) => [skill_domain_id, belt_id]));
                    return <tr key={student.id}>
                        <th>{student.name}</th>
                        {skill_domains.map(skill_domain => {
                            const belt_id = belt_id_by_skill_domain_id[skill_domain.id];
                            if (belt_id === undefined) {
                                return <td key={skill_domain.id}>-</td>;
                            }
                            const belt = belt_by_id[belt_id]!;
                            return <td key={skill_domain.id}>{belt.name}</td>;
                        })}
                    </tr>;
                })}
            </tbody>
        </Table>
    </>;
}

function Layout() {
    return <>
        <Navbar>
            <Navbar.Brand as={Link} to="/">Skills</Navbar.Brand>
            <Nav>
                <Nav.Item><Nav.Link as={Link} to="/">Home</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={Link} to="/skill-domains">Skill Domains</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={Link} to="/belts">Belts</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={Link} to="/class-levels">Class Levels</Nav.Link></Nav.Item>
            </Nav>
        </Navbar>
        <Outlet />
    </>;
}

function App() {
    return <Routes>
        <Route path="/" element={<Layout />}>
            <Route path="belts" element={<BeltsView />} />
            <Route path="skill-domains" element={<SkillDomainsView />} />
            <Route path="class-levels">
                <Route index element={<ClassLevelsView />} />
                <Route path=":class_level_id" element={<ClassLevelView />} />
            </Route>
            <Route path="school-classes/:school_class_id">
                <Route index element={<SchoolClassView />} />
                <Route path="belts" element={<SchoolClassBeltsView />} />
            </Route>
        </Route>
    </Routes>;
}

ReactDOM.render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
    document.getElementById('root'),
);
