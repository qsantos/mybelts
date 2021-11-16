import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { ReactNode, StrictMode, useEffect, useState } from 'react';

import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
    BeltList, BeltsService,
    ClassLevelList, ClassLevelsService,
    SchoolClassList, SchoolClassesService, SchoolClassStudentBelts,
    SkillDomainList, SkillDomainsService,
    StudentList, StudentsService,
    BeltAttemptList,
} from './api';
import './index.css';

import { CreateSkillDomainButton, EditSkillDomainButton, DeleteSkillDomainButton } from './skill-domain';
import { CreateBeltButton, EditBeltButton, DeleteBeltButton, MoveBeltButton } from './belt';
import { CreateClassLevelButton, EditClassLevelButton, DeleteClassLevelButton } from './class-level';
import { CreateSchoolClassButton, EditSchoolClassButton, DeleteSchoolClassButton } from './school-class';
import { CreateStudentButton, EditStudentButton, DeleteStudentButton } from './student';
import { CreateBeltAttemptButton, EditBeltAttemptButton, DeleteBeltAttemptButton } from './belt-attempt';

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
            setBeltList({ ...beltList, belts });
        }}/>
        <h4>List of available belts</h4>
        <Table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Color</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {sorted_belts.map((belt, index) =>
                    <tr key={belt.id}>
                        <td>{belt.rank}</td>
                        <td>{belt.name}</td>
                        <td><Form.Control type="color" value={belt.color} disabled /></td>
                        <td>
                            <MoveBeltButton buttonContent="↑" direction_name="Up" direction={-1} belt={belt} belts={sorted_belts} setBeltList={setBeltList} />
                            {' '}
                            <MoveBeltButton buttonContent="↓" direction_name="Down" direction={1} belt={belt} belts={sorted_belts} setBeltList={setBeltList} />
                            {' '}
                            <EditBeltButton belt={belt} changedCallback={new_belt => {
                                belts[index] = new_belt;
                                setBeltList({ ...beltList, belts });
                            }} />
                            {' '}
                            <DeleteBeltButton belt={belt} deletedCallback={() => {
                                belts.splice(index, 1);
                                for (let j = index; j < belts.length; j += 1) {
                                    const other_belt = belts[j];
                                    if (other_belt !== undefined) {  // always true
                                        other_belt.rank -= 1;
                                    }
                                }
                                setBeltList({ ...beltList, belts });
                            }} />
                        </td>
                    </tr>)}
            </tbody>
        </Table>
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
    const sorted_skill_domains = skill_domains.sort((a, b) => a.name.localeCompare(b.name));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem active href="/skill-domains">Skill Domains</BreadcrumbItem>
        </Breadcrumb>
        <h3>Skill Domains</h3>
        <CreateSkillDomainButton createdCallback={skill_domain => {
            skill_domains.push(skill_domain);
            setSkillDomainList({ ...skillDomainList, skill_domains });
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
                                setSkillDomainList({ ...skillDomainList, skill_domains });
                            }} />
                            {' '}
                            <DeleteSkillDomainButton skill_domain={skill_domain} deletedCallback={() => {
                                skill_domains.splice(index, 1);
                                setSkillDomainList({ ...skillDomainList, skill_domains });
                            }} />
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
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
    const sorted_class_levels = class_levels.sort((a, b) => a.prefix.localeCompare(b.prefix));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem active href="/class-levels">Levels</BreadcrumbItem>
        </Breadcrumb>
        <h3>Class Levels</h3>
        <h3>List of available class levels</h3>
        <CreateClassLevelButton createdCallback={class_level => {
            class_levels.push(class_level);
            setClassLevelList({ ...classLevelList, class_levels });
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
                                setClassLevelList({ ...classLevelList, class_levels });
                            }} />
                            {' '}
                            <DeleteClassLevelButton class_level={class_level} deletedCallback={() => {
                                class_levels.splice(index, 1);
                                setClassLevelList({ ...classLevelList, class_levels });
                            }} />
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}

function ClassLevelView() {
    const params = useParams();
    if (params.class_level_id === undefined) {
        // should not happen
        console.error('Attribute class_level_id of <ClassLevelView /> is undefined');
        return <></>;
    }
    const class_level_id = params.class_level_id;

    const [schoolClassList, setSchoolClassList] = useState<null | SchoolClassList>(null);
    const navigate = useNavigate();

    useEffect(() => {
        ClassLevelsService.getClassLevelSchoolClassesResource(parseInt(class_level_id)).then(setSchoolClassList);
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
    const sorted_school_classes = school_classes.sort((a, b) => a.suffix.localeCompare(b.suffix));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
            <BreadcrumbItem active href={`/class-levels/${class_level.id}`}>Level {class_level.prefix}</BreadcrumbItem>
        </Breadcrumb>
        <h3>Class level: {class_level.prefix}</h3>
        <EditClassLevelButton class_level={class_level} changedCallback={new_class_level => {
            setSchoolClassList({ ...schoolClassList, class_level: new_class_level });
        }} />
        {' '}
        <DeleteClassLevelButton class_level={class_level} deletedCallback={() => navigate('/class-levels')} />
        <h4>List of classes</h4>
        <CreateSchoolClassButton class_level_id={class_level.id} createdCallback={school_class => {
            school_classes.push(school_class);
            setSchoolClassList({ ...schoolClassList, school_classes });
        }} />
        <Table>
            <thead>
                <tr>
                    <th>Suffix</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {sorted_school_classes.map((school_class, index) =>
                    <tr key={school_class.id}>
                        <td>
                            <Nav.Link as={Link} to={`/school-classes/${school_class.id}`}>
                                {school_class.suffix}
                            </Nav.Link>
                        </td>
                        <td>
                            <Button onClick={() => navigate(`/school-classes/${school_class.id}`)}>🔍</Button>
                            {' '}
                            <EditSchoolClassButton school_class={school_class} changedCallback={new_school_class => {
                                school_classes[index] = new_school_class;
                                setSchoolClassList({ ...schoolClassList, school_classes });
                            }} />
                            {' '}
                            <DeleteSchoolClassButton school_class={school_class} deletedCallback={() => {
                                school_classes.splice(index, 1);
                                setSchoolClassList({ ...schoolClassList, school_classes });
                            }} />
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}

function SchoolClassView() {
    const params = useParams();
    if (params.school_class_id === undefined) {
        // should not happen
        console.error('Attribute school_class_id of <ClassLevelView /> is undefined');
        return <></>;
    }
    const school_class_id = params.school_class_id;

    const [studentList, setStudentList] = useState<null | StudentList>(null);
    const navigate = useNavigate();

    useEffect(() => {
        SchoolClassesService.getSchoolClassResource(parseInt(school_class_id)).then(setStudentList);
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
    const sorted_students = students.sort((a, b) => a.name.localeCompare(b.name));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
            <BreadcrumbItem href={`/class-levels/${class_level.id}`}>Level {class_level.prefix}</BreadcrumbItem>
            <BreadcrumbItem active href={`/school-classes/${school_class.id}`}>Class {school_class.suffix}</BreadcrumbItem>
        </Breadcrumb>
        <h3>Class {class_level.prefix}{school_class.suffix}</h3>
        <OverlayTrigger overlay={<Tooltip>Belts</Tooltip>}>
            <Button onClick={() => navigate('belts')}>🥋</Button>
        </OverlayTrigger>
        {' '}
        <EditSchoolClassButton school_class={school_class} changedCallback={new_school_class => {
            setStudentList({ ...studentList, school_class: new_school_class });
        }} />
        {' '}
        <DeleteSchoolClassButton school_class={school_class} deletedCallback={() => navigate(`/class-levels/${class_level.id}`)} />
        <h4>List of students</h4>
        <CreateStudentButton school_class_id={school_class.id} createdCallback={student => {
            students.push(student);
            setStudentList({ ...studentList, students });
        }} />
        <Table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {sorted_students.map((student, index) =>
                    <tr key={student.id}>
                        <td>
                            <Nav.Link as={Link} to={`/students/${student.id}`}>
                                {student.name}
                            </Nav.Link>
                        </td>
                        <td>
                            <Button onClick={() => navigate(`/students/${student.id}`)}>🔍</Button>
                            {' '}
                            <EditStudentButton student={student} changedCallback={new_student => {
                                students[index] = new_student;
                                setStudentList({ ...studentList, students });
                            }} />
                            {' '}
                            <DeleteStudentButton student={student} deletedCallback={() => {
                                students.splice(index, 1);
                                setStudentList({ ...studentList, students });
                            }} />
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>;
}

function StudentView() {
    const params = useParams();
    if (params.student_id === undefined) {
        // should not happen
        console.error('Attribute student_id of <StudentView /> is undefined');
        return <></>;
    }
    const student_id = params.student_id;

    const [beltList, setBeltList] = useState<null | BeltList>(null);
    const [skillDomainList, setSkillDomainList] = useState<null | SkillDomainList>(null);
    const [beltAttemptList, setBeltAttemptList] = useState<null | BeltAttemptList>(null);
    const navigate = useNavigate();

    useEffect(() => {
        BeltsService.getBeltsResource().then(setBeltList);
        SkillDomainsService.getSkillDomainsResource().then(setSkillDomainList);
        StudentsService.getStudentBeltAttemptsResource(parseInt(student_id)).then(setBeltAttemptList);
    }, [student_id]);

    if (beltList === null || skillDomainList === null || beltAttemptList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
                <BreadcrumbItem>Level ?</BreadcrumbItem>
                <BreadcrumbItem active href="/">Class ?</BreadcrumbItem>
                <BreadcrumbItem active href={`/student/${student_id}`}>Student ?</BreadcrumbItem>
            </Breadcrumb>
            <Link to="belts">Belts</Link>
            <br />
            <Loader />
        </>;
    }

    const { skill_domains } = skillDomainList;
    const { belts } = beltList;
    const { class_level, school_class, student, belt_attempts } = beltAttemptList;

    const sorted_belt_attempts = belt_attempts.sort((a, b) => b.date.localeCompare(a.date));
    const skill_domain_by_id = Object.fromEntries(skill_domains.map(skill_domain => [skill_domain.id, skill_domain]));
    const belt_by_id = Object.fromEntries(belts.map(belt => [belt.id, belt]));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
            <BreadcrumbItem href={`/class-levels/${class_level.id}`}>Level {class_level.prefix}</BreadcrumbItem>
            <BreadcrumbItem active href={`/school-classes/${school_class.id}`}>Class {school_class.suffix}</BreadcrumbItem>
            <BreadcrumbItem active href={`/student/${student.id}`}>Student {student.name}</BreadcrumbItem>
        </Breadcrumb>
        <h3>Student {student.name}</h3>
        <EditStudentButton student={student} changedCallback={new_student => {
            setBeltAttemptList({ ...beltAttemptList, student: new_student });
        }} />
        {' '}
        <DeleteStudentButton student={student} deletedCallback={() => navigate(`/school-classes/${school_class.id}`)} />
        <h4>List of belt attempts:</h4>
        <CreateBeltAttemptButton student={student} skill_domains={skill_domains} belts={belts} createdCallback={belt_attempt => {
            belt_attempts.push(belt_attempt);
            setBeltAttemptList({ ...beltAttemptList, belt_attempts });
        }} />
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
                {sorted_belt_attempts.map((belt_attempt, index) => {
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
                                setBeltAttemptList({ ...beltAttemptList, belt_attempts });
                            }} />
                            {' '}
                            <DeleteBeltAttemptButton belt_attempt={belt_attempt} student={student} deletedCallback={() => {
                                belt_attempts.splice(index, 1);
                                setBeltAttemptList({ ...beltAttemptList, belt_attempts });
                            }} />
                        </td>
                    </tr>;
                })}
            </tbody>
        </Table>
    </>;
}

function SchoolClassBeltsView() {
    const params = useParams();
    if (params.school_class_id === undefined) {
        // should not happen
        console.error('Attribute school_class_id of <ClassLevelView /> is undefined');
        return <></>;
    }
    const school_class_id = params.school_class_id;

    const [schoolClassStudentBelts, setSchoolClassStudentBelts] = useState<null | SchoolClassStudentBelts>(null);

    useEffect(() => {
        SchoolClassesService.getSchoolClassStudentBeltsResource(parseInt(school_class_id)).then(setSchoolClassStudentBelts);
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
                            const belt = belt_by_id[belt_id];
                            if (belt === undefined) {
                                return <td key={skill_domain.id}>-</td>;
                            }
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
            <Route path="students/:student_id" element={<StudentView />} />
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
