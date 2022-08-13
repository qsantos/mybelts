import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { ReactNode, StrictMode, useEffect, useState } from 'react';

import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';

import {
    OpenAPI,
    LoginInfo,
    UserList, UsersService,
    BeltList, BeltsService,
    ClassLevelList, ClassLevelsService,
    SchoolClassList, SchoolClassesService, SchoolClassStudentBelts,
    SkillDomainList, SkillDomainsService,
    StudentList, StudentsService,
    BeltAttemptList,
} from './api';
import { getAPIError } from './lib';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { LoginButton, LogoutButton, LoginContext } from './auth';
import { CreateUserButton, UserListing } from './user';
import { CreateSkillDomainButton, SkillDomainListing } from './skill-domain';
import { CreateBeltButton, BeltListing } from './belt';
import { CreateClassLevelButton, EditClassLevelButton, DeleteClassLevelButton, ClassLevelListing } from './class-level';
import { CreateSchoolClassButton, EditSchoolClassButton, DeleteSchoolClassButton, SchoolClassListing } from './school-class';
import { CreateStudentButton, EditStudentButton, DeleteStudentButton, UpdateStudentRanks, StudentListing } from './student';
import { CreateBeltAttemptButton, BeltAttemptListing, BeltAttemptGrid,  } from './belt-attempt';

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

function UsersView() {
    const [errorMessage, setErrorMessage] = useState('');
    const [userList, setUserList] = useState<null | UserList>(null);

    useEffect(() => {
        UsersService
            .getUsersResource()
            .then(setUserList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
    }, []);

    if (userList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem active href="/users">Users</BreadcrumbItem>
            </Breadcrumb>
            <h3>Users</h3>
            {errorMessage ? <Alert variant="danger">Error: {errorMessage}</Alert> : <Loader />}
        </>;
    }

    const { users } = userList;

    const sorted_users = users.sort((a, b) => a.name.localeCompare(b.name));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem active href="/users">Users</BreadcrumbItem>
        </Breadcrumb>
        <h3>Users</h3>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <CreateUserButton createdCallback={new_user => {
            setUserList({ ...userList, users: [...users, new_user] });
        }}/>
        <h4>List of available users</h4>
        <UserListing
            users={sorted_users}
            setUsers={new_users => setUserList({ ...userList, users: new_users })}
        />
    </>;
}

function BeltsView() {
    const [errorMessage, setErrorMessage] = useState('');
    const [beltList, setBeltList] = useState<null | BeltList>(null);

    useEffect(() => {
        BeltsService
            .getBeltsResource()
            .then(setBeltList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
    }, []);

    if (beltList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem active href="/belts">Belts</BreadcrumbItem>
            </Breadcrumb>
            <h3>Belts</h3>
            {errorMessage ? <Alert variant="danger">Error: {errorMessage}</Alert> : <Loader />}
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
        {errorMessage && <Alert variant="danger">Error: {errorMessage}</Alert>}
        <CreateBeltButton createdCallback={new_belt => {
            setBeltList({ ...beltList, belts: [...belts, new_belt] });
        }}/>
        <h4>List of available belts</h4>
        <BeltListing
            belts={sorted_belts}
            setBelts={new_belts => setBeltList({ ...beltList, belts: new_belts })}
            setErrorMessage={setErrorMessage}
        />
    </>;
}

function SkillDomainsView() {
    const [errorMessage, setErrorMessage] = useState('');
    const [skillDomainList, setSkillDomainList] = useState<null | SkillDomainList>(null);

    useEffect(() => {
        SkillDomainsService
            .getSkillDomainsResource()
            .then(setSkillDomainList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
    }, []);

    if (skillDomainList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem active href="/skill-domains">Skill Domains</BreadcrumbItem>
            </Breadcrumb>
            <h3>Skill Domains</h3>
            {errorMessage ? <Alert variant="danger">Error: {errorMessage}</Alert> : <Loader />}
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
        <CreateSkillDomainButton createdCallback={new_skill_domain => {
            setSkillDomainList({ ...skillDomainList, skill_domains: [...skill_domains, new_skill_domain] });
        }}/>
        <h4>List of available skill domains</h4>
        <SkillDomainListing
            skill_domains={sorted_skill_domains}
            setSkillDomains={new_skill_domains => setSkillDomainList({ ...skillDomainList, skill_domains: new_skill_domains })}
        />
    </>;
}

function ClassLevelsView() {
    const [errorMessage, setErrorMessage] = useState('');
    const [classLevelList, setClassLevelList] = useState<null | ClassLevelList>(null);

    useEffect(() => {
        ClassLevelsService
            .getClassLevelsResource()
            .then(setClassLevelList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
    }, []);

    if (classLevelList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem active href="/class-levels">Levels</BreadcrumbItem>
            </Breadcrumb>
            <h3>Class Levels</h3>
            {errorMessage ? <Alert variant="danger">Error: {errorMessage}</Alert> : <Loader />}
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
        <CreateClassLevelButton createdCallback={new_class_level => {
            setClassLevelList({ ...classLevelList, class_levels: [...class_levels, new_class_level] });
        }} />
        <ClassLevelListing
            class_levels={sorted_class_levels}
            setClassLevels={new_class_levels => setClassLevelList({ ...classLevelList, class_levels: new_class_levels })}
        />
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

    const [errorMessage, setErrorMessage] = useState('');
    const [schoolClassList, setSchoolClassList] = useState<null | SchoolClassList>(null);
    const navigate = useNavigate();

    useEffect(() => {
        ClassLevelsService
            .getClassLevelSchoolClassesResource(parseInt(class_level_id))
            .then(setSchoolClassList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
    }, [class_level_id]);

    if (schoolClassList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
                <BreadcrumbItem active href={`/class-levels/${class_level_id}`}>Level ?</BreadcrumbItem>
            </Breadcrumb>
            <h3>Class level: ?</h3>
            {errorMessage ? <Alert variant="danger">Error: {errorMessage}</Alert> : <Loader />}
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
        <CreateSchoolClassButton class_level_id={class_level.id} createdCallback={new_school_class => {
            setSchoolClassList({ ...schoolClassList, school_classes: [...school_classes, new_school_class] });
        }} />
        <SchoolClassListing
            school_classes={sorted_school_classes}
            setSchoolClasses={new_school_classes => setSchoolClassList({ ...schoolClassList, school_classes: new_school_classes })}
        />
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

    const [errorMessage, setErrorMessage] = useState('');
    const [studentList, setStudentList] = useState<null | StudentList>(null);
    const navigate = useNavigate();

    useEffect(() => {
        SchoolClassesService
            .getSchoolClassResource(parseInt(school_class_id))
            .then(setStudentList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
    }, [school_class_id]);

    if (studentList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
                <BreadcrumbItem>Level ?</BreadcrumbItem>
                <BreadcrumbItem active href="/">Class ?</BreadcrumbItem>
            </Breadcrumb>
            <h3>Class: ?</h3>
            <OverlayTrigger overlay={<Tooltip>Belts</Tooltip>}>
                <Button onClick={() => navigate('belts')}>🥋</Button>
            </OverlayTrigger>
            {' '}
            {errorMessage ? <Alert variant="danger">Error: {errorMessage}</Alert> : <Loader />}
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
        <h3>Class: {class_level.prefix}{school_class.suffix}</h3>
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
        <CreateStudentButton school_class_id={school_class.id} createdCallback={new_student => {
            setStudentList({ ...studentList, students: [...students, new_student] });
        }} />
        {' '}
        <UpdateStudentRanks students={students} changedCallback={new_students => {
            setStudentList({ ...studentList, students: new_students });
        }} />
        <StudentListing
            students={students}
            setStudents={new_students => setStudentList({ ...studentList, students: new_students })}
        />
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

    const [errorMessage, setErrorMessage] = useState('');
    const [beltList, setBeltList] = useState<null | BeltList>(null);
    const [skillDomainList, setSkillDomainList] = useState<null | SkillDomainList>(null);
    const [beltAttemptList, setBeltAttemptList] = useState<null | BeltAttemptList>(null);
    const navigate = useNavigate();

    useEffect(() => {
        BeltsService
            .getBeltsResource()
            .then(setBeltList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
        SkillDomainsService
            .getSkillDomainsResource()
            .then(setSkillDomainList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
        StudentsService
            .getStudentBeltAttemptsResource(parseInt(student_id))
            .then(setBeltAttemptList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
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
            <h3>Student: ?</h3>
            {errorMessage ? <Alert variant="danger">Error: {errorMessage}</Alert> : <Loader />}
        </>;
    }

    // skill domains and belts must be fetched separately to make sure we have them all
    const { skill_domains } = skillDomainList;
    const { belts } = beltList;
    const { class_level, school_class, student, belt_attempts } = beltAttemptList;

    const sorted_belt_attempts = belt_attempts.sort((a, b) => b.date.localeCompare(a.date));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
            <BreadcrumbItem href={`/class-levels/${class_level.id}`}>Level {class_level.prefix}</BreadcrumbItem>
            <BreadcrumbItem active href={`/school-classes/${school_class.id}`}>Class {school_class.suffix}</BreadcrumbItem>
            <BreadcrumbItem active href={`/student/${student.id}`}>Student {student.name}</BreadcrumbItem>
        </Breadcrumb>
        <h3>Student: {student.name}</h3>
        <EditStudentButton student={student} changedCallback={new_student => {
            setBeltAttemptList({ ...beltAttemptList, student: new_student });
        }} />
        {' '}
        <DeleteStudentButton student={student} deletedCallback={() => navigate(`/school-classes/${school_class.id}`)} />
        <h4>List of belt attempts:</h4>
        <CreateBeltAttemptButton student={student} skill_domains={skill_domains} belts={belts} createdCallback={new_belt_attempt => {
            setBeltAttemptList({ ...beltAttemptList, belt_attempts: [...belt_attempts, new_belt_attempt] });
        }} />
        <BeltAttemptListing
            skill_domains={skill_domains}
            belts={belts}
            student={student}
            belt_attempts={sorted_belt_attempts}
            setBeltAttempts={new_belt_attempts => setBeltAttemptList({ ...beltAttemptList, belt_attempts: new_belt_attempts })}
        />
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

    const [errorMessage, setErrorMessage] = useState('');
    const [schoolClassStudentBelts, setSchoolClassStudentBelts] = useState<null | SchoolClassStudentBelts>(null);

    useEffect(() => {
        SchoolClassesService
            .getSchoolClassStudentBeltsResource(parseInt(school_class_id))
            .then(setSchoolClassStudentBelts)
            .catch(error => { setErrorMessage(getAPIError(error)); });
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
            <h3>Belts of class: ?</h3>
            {errorMessage ? <Alert variant="danger">Error: {errorMessage}</Alert> : <Loader />}
        </>;
    }

    const { class_level, school_class, belts, skill_domains, student_belts } = schoolClassStudentBelts;

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/class-levels">Levels</BreadcrumbItem>
            <BreadcrumbItem href={`/class-levels/${class_level.id}`}>Level {class_level.prefix}</BreadcrumbItem>
            <BreadcrumbItem active href={`/school-classes/${school_class.id}`}>Class {school_class.suffix}</BreadcrumbItem>
            <BreadcrumbItem active href={`/school-classes/${school_class.id}/belts`}>Belts</BreadcrumbItem>
        </Breadcrumb>
        <h3>Belts of class: {class_level.prefix}{school_class.suffix}</h3>
        <BeltAttemptGrid
            skill_domains={skill_domains}
            belts={belts}
            student_belts={student_belts}
        />
    </>;
}

function Layout() {
    const rawSavedLoginInfo = localStorage.getItem('login_info');
    const savedLoginInfo = rawSavedLoginInfo === null ? null : (JSON.parse(rawSavedLoginInfo) as LoginInfo);
    const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(savedLoginInfo);
    if (loginInfo === null) {
        OpenAPI.TOKEN = undefined;
        localStorage.removeItem('login_info');
    } else {
        OpenAPI.TOKEN = loginInfo.token;
        localStorage.setItem('login_info', JSON.stringify(loginInfo));
    }

    return <LoginContext.Provider value={loginInfo}>
        <Navbar>
            <Navbar.Brand as={Link} to="/">Skills</Navbar.Brand>
            <Nav className="me-auto">
                <Nav.Item><Nav.Link as={Link} to="/">Home</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={Link} to="/users">Users</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={Link} to="/skill-domains">Skill Domains</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={Link} to="/belts">Belts</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={Link} to="/class-levels">Class Levels</Nav.Link></Nav.Item>
            </Nav>
            {loginInfo?.student ? <Badge bg="info" className="me-2">{loginInfo.student.name}</Badge> : null}
            {loginInfo
                ? <>
                    <Badge bg="info" className="me-2">{loginInfo.user.name}</Badge>
                    <LogoutButton className="me-2" loggedOutCallback={() => setLoginInfo(null)}/>
                </>
                : <>
                    <Badge bg="warning" className="me-2">Not connected</Badge>
                    <LoginButton className="me-2" loggedInCallback={setLoginInfo}/>
                </>
            }
        </Navbar>
        {loginInfo && <Outlet />}
    </LoginContext.Provider>;
}

function App() {
    return <Routes>
        <Route path="/" element={<Layout />}>
            <Route path="users" element={<UsersView />} />
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
