import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Outlet, Route, Routes, useParams } from 'react-router-dom';
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
    Belt, BeltList, BeltsService, ClassLevelList, ClassLevelsService,
    SchoolClassList, SchoolClassesService, SchoolClassStudentBelts,
    SkillDomain, SkillDomainList, SkillDomainsService, StudentList,
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

function CreateBeltButton({ createBeltCallback } : { createBeltCallback?: (belt: Belt) => void }) {
    const [showCreateBelt, setShowCreateBelt] = useState(false);
    const [creatingBelt, setCreatingBelt] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreatingBelt(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
        };
        BeltsService.postBeltsResource({
            name: target.name.value,
        }).then(({ belt }) => {
            setShowCreateBelt(false);
            setCreatingBelt(false);
            if (createBeltCallback !== undefined) {
                createBeltCallback(belt);
            }
        });
    }

    return <>
        <Button onClick={() => setShowCreateBelt(true)}>Add</Button>
        <Modal show={showCreateBelt}>
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
                    <Button variant="secondary" onClick={() => setShowCreateBelt(false)}>Cancel</Button>
                    {creatingBelt
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

interface DeleteBeltButtonProps {
    belt: Belt;
    belts: Belt[];
    setBeltList: (beltList: BeltList) => void;
}

function DeleteBeltButton({ belt, belts, setBeltList } : DeleteBeltButtonProps) {
    const [showDeleteBelt, setShowDeleteBelt] = useState(false);
    const [deletingBelt, setDeletingBelt] = useState(false);

    function handleDelete() {
        setDeletingBelt(true);
        BeltsService.deleteBeltResource(belt.id).then(() => {
            setShowDeleteBelt(false);
            setDeletingBelt(false);
            // adjust belt list
            belts.splice(belt.rank - 1, 1);
            for (let index = belt.rank - 1; index < belts.length; index += 1) {
                belts[index]!.rank -= 1;
            }
            setBeltList({ belts: belts });
        });
    }

    return <>
        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <Button variant="danger" onClick={() => setShowDeleteBelt(true)}>🗑️</Button>
        </OverlayTrigger>
        <Modal show={showDeleteBelt}>
            <Modal.Header>
                <Modal.Title>Delete Belt</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete the belt “{belt.name}”?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDeleteBelt(false)}>Cancel</Button>
                {deletingBelt
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

    const sortedBelts = belts.sort((a, b) => (a.rank - b.rank));
    // TODO: handle case where result is false
    sortedBelts.reduce((previous, belt, index) => {
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
        <CreateBeltButton createBeltCallback={belt => setBeltList({ belts: belts.concat([belt]) })}/>
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
                {sortedBelts.map(belt =>
                    <tr key={belt.id}>
                        <td>{belt.rank}</td>
                        <td>{belt.name}</td>
                        <td>
                            <MoveBeltButton buttonContent="↑" direction_name="Up" direction={-1} belt={belt} belts={sortedBelts} setBeltList={setBeltList} />
                            {' '}
                            <MoveBeltButton buttonContent="↓" direction_name="Down" direction={1} belt={belt} belts={sortedBelts} setBeltList={setBeltList} />
                            {' '}
                            <DeleteBeltButton belt={belt} belts={sortedBelts} setBeltList={setBeltList} />
                        </td>
                    </tr>)}
            </tbody>
        </Table>
    </>;
}

function CreateSkillDomainButton({ createSkillDomainCallback } : { createSkillDomainCallback?: (skill_domain: SkillDomain) => void }) {
    const [showCreateSkillDomain, setShowCreateSkillDomain] = useState(false);
    const [creatingSkillDomain, setCreatingSkillDomain] = useState(false);

    function handleSubmit(event: FormEvent) {
        setCreatingSkillDomain(true);
        event.preventDefault();
        const target = event.target as typeof event.target & {
            name: {value: string};
        };
        SkillDomainsService.postSkillDomainsResource({
            name: target.name.value,
        }).then(({ skill_domain }) => {
            setShowCreateSkillDomain(false);
            setCreatingSkillDomain(false);
            if (createSkillDomainCallback !== undefined) {
                createSkillDomainCallback(skill_domain);
            }
        });
    }

    return <>
        <Button onClick={() => setShowCreateSkillDomain(true)}>Add</Button>
        <Modal show={showCreateSkillDomain}>
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
                    <Button variant="secondary" onClick={() => setShowCreateSkillDomain(false)}>Cancel</Button>
                    {creatingSkillDomain
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
        <CreateSkillDomainButton createSkillDomainCallback={skill_domain => setSkillDomainList({ skill_domains: skill_domains.concat([skill_domain]) })}/>
        <h4>List of available skill domains</h4>
        <Table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {sorted_skill_domains.map(skill_domain =>
                    <tr key={skill_domain.id}>
                        <td>{skill_domain.name}</td>
                        <td>TODO</td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}

function ClassLevelsView() {
    const [classLevelList, setClassLevelList] = useState<null | ClassLevelList>(null);

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

    return <ListGroup>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem active href="/class-levels">Levels</BreadcrumbItem>
        </Breadcrumb>
        {sorted_class_levels.map(class_level =>
            <ListGroup.Item action key={class_level.id}>
                <Nav.Link as={Link} to={`${class_level.id}`}>
                    {class_level.prefix}
                </Nav.Link>
            </ListGroup.Item>
        )}
    </ListGroup>;
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
