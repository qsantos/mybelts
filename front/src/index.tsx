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
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BeltList, BeltsService, ClassLevelList, ClassLevelsService, SchoolClassList, SchoolClassesService, SchoolClassStudentBelts, StudentList } from './api';
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

function BeltsView() {
    const [beltList, setBeltList] = useState<null | BeltList>(null);
    const [showCreateBelt, setShowCreateBelt] = useState(false);
    const [creatingBelt, setCreatingBelt] = useState(false);

    useEffect(() => {
        BeltsService.getBeltsResource().then(setBeltList);
    }, []);

    if (beltList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem active href="/belts">Belts</BreadcrumbItem>
            </Breadcrumb>
            <Loader />
        </>;
    }

    const { belts } = beltList;

    function handleCancel() {
        setShowCreateBelt(false);
        setCreatingBelt(false);
    }
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
            setBeltList({ belts: belts.concat([belt]) });  // TODO: just refresh
        });
    }

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem active href="/belts">Belts</BreadcrumbItem>
        </Breadcrumb>
        <h3>Belts</h3>
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
                    <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
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
        <h4>List of available belts</h4>
        <ListGroup>
            {belts.map(belt => <ListGroup.Item key={belt.id}>{belt.name}</ListGroup.Item>)}
        </ListGroup>
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

    return <ListGroup>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem active href="/class-levels">Levels</BreadcrumbItem>
        </Breadcrumb>
        {class_levels.map(class_level =>
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

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
            <BreadcrumbItem active href={`/class-levels/${class_level.id}`}>Level {class_level.prefix}</BreadcrumbItem>
        </Breadcrumb>
        <h3>{class_level.prefix}</h3>
        {school_classes.length === 0 ? 'No school class' : <ListGroup>
            {school_classes.map(school_class =>
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
