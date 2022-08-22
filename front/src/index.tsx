import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { ReactNode, StrictMode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import './i18n';

import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';

import {
    OpenAPI,
    LoginInfo,
    DefaultService, MissingI18nKeyEventList,
    UserList, UsersService,
    BeltList, BeltsService,
    ClassLevelList, ClassLevelsService,
    SchoolClassList, SchoolClassesService,
    SkillDomainList, SkillDomainsService,
    StudentList, StudentsService,
    EvaluationList,
    WaitlistEntryList,
} from './api';
import { OpenAPIWithCallback } from './api/core/request';
import { formatDatetime, getAPIError } from './lib';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { AdminOnly, LoginFormWidget, LogoutButton, LoginContext, is_admin } from './auth';
import { CreateUserButton, UserListing } from './user';
import { CreateSkillDomainButton, SkillDomainListing } from './skill-domain';
import { CreateBeltButton, BeltListing } from './belt';
import { CreateClassLevelButton, EditClassLevelButton, DeleteClassLevelButton, ClassLevelListing } from './class-level';
import { CreateSchoolClassButton, EditSchoolClassButton, DeleteSchoolClassButton, SchoolClassListing, SchoolClassWaitlist, ManageClassWaitlist } from './school-class';
import { CreateStudentButton, EditStudentButton, DeleteStudentButton, UpdateStudentRanks, StudentBelts } from './student';
import { CreateEvaluationButton, EvaluationListing, EvaluationGrid  } from './evaluation';

function BreadcrumbItem({ children, href, active }: { children: ReactNode, href?: string, active?: boolean }) {
    if (href) {
        return <Breadcrumb.Item linkAs={Link} linkProps={{to: href}}>{children}</Breadcrumb.Item>;
    } else {
        return <Breadcrumb.Item active={active === undefined ? false : active}>{children}</Breadcrumb.Item>;
    }
}

function Loader() {
    const { t } = useTranslation();
    return <Spinner animation="border" role="status">
        <span className="visually-hidden">{t('loading')}</span>
    </Spinner>;
}

function HomeView() {
    const loginInfo = React.useContext(LoginContext);
    if (loginInfo === null) {
        // not connected
        return null;
    }

    const student = loginInfo.student;
    const user = loginInfo.user;

    if (student) {
        // student
        return <StudentWidget student_id={student.id} />;
    } else if (user.is_admin) {
        // admin
        return <>
            Hello {user.username}. You last logged in on {formatDatetime(user.last_login)}.
        </>;
    } else {
        // other
        return <>Hello {user.username}</>;
    }
}

function I18nView() {
    if (!is_admin()) {
        return null;
    }

    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [eventList, setEventList] = useState<null | MissingI18nKeyEventList>(null);

    useEffect(() => {
        DefaultService
            .getMissingI18NKeyResource()
            .then(setEventList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
    }, []);

    if (eventList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem active href="/i18n">i18n</BreadcrumbItem>
            </Breadcrumb>
            <h3>i18n</h3>
            {errorMessage ? <Alert variant="danger">{t('error')}: {errorMessage}</Alert> : <Loader />}
        </>;
    }

    const { events } = eventList;

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
            <BreadcrumbItem active href="/i18n">i18n</BreadcrumbItem>
        </Breadcrumb>
        <h3>i18n</h3>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <Table>
            <thead>
                <tr>
                    <th>Language</th>
                    <th>Namespace</th>
                    <th>Key</th>
                    <th>Count</th>
                </tr>
            </thead>
            <tbody>
                {events.map((event, i) => (
                    <tr key={i}>
                        <th>{event.language}</th>
                        <th>{event.namespace}</th>
                        <th>{event.key}</th>
                        <th>{event.count}</th>
                    </tr>
                ))}
            </tbody>
        </Table>
    </>;
}

function UsersView() {
    if (!is_admin()) {
        return null;
    }

    const { t } = useTranslation();
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
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem active href="/users">{t('user.list.title.primary')}</BreadcrumbItem>
            </Breadcrumb>
            <h3>{t('user.list.title.primary')}</h3>
            {errorMessage ? <Alert variant="danger">{t('error')}: {errorMessage}</Alert> : <Loader />}
        </>;
    }

    const { users } = userList;

    const sorted_users = users.sort((a, b) => a.username.localeCompare(b.username));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
            <BreadcrumbItem active href="/users">{t('user.list.title.primary')}</BreadcrumbItem>
        </Breadcrumb>
        <h3>{t('user.list.title.primary')}</h3>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <CreateUserButton createdCallback={new_user => {
            setUserList({ ...userList, users: [...users, new_user] });
        }}/>
        <h4>{t('user.list.title.secondary')}</h4>
        <UserListing
            users={sorted_users}
            setUsers={new_users => setUserList({ ...userList, users: new_users })}
        />
    </>;
}

function BeltsView() {
    const { t } = useTranslation();
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
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem active href="/belts">{t('belt.list.title.primary')}</BreadcrumbItem>
            </Breadcrumb>
            <h3>{t('belt.list.title.primary')}</h3>
            {errorMessage ? <Alert variant="danger">{t('error')}: {errorMessage}</Alert> : <Loader />}
        </>;
    }

    const { belts } = beltList;

    const sorted_belts = belts.sort((a, b) => (a.rank - b.rank));
    // TODO: handle case where result is false
    sorted_belts.reduce((previous, belt, index) => {
        if (belt.rank != index + 1) {
            console.error('Inconsistent ranking of belts ' + belt.id + '!');
            return false;
        }
        return previous;
    }, true);

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
            <BreadcrumbItem active href="/belts">{t('belt.list.title.primary')}</BreadcrumbItem>
        </Breadcrumb>
        <h3>{t('belt.list.title.primary')}</h3>
        {errorMessage && <Alert variant="danger">{t('error')}: {errorMessage}</Alert>}
        <AdminOnly>
            <CreateBeltButton createdCallback={new_belt => {
                setBeltList({ ...beltList, belts: [...belts, new_belt] });
            }}/>
        </AdminOnly>
        <h4>{t('belt.list.title.secondary')}</h4>
        <BeltListing
            belts={sorted_belts}
            setBelts={new_belts => setBeltList({ ...beltList, belts: new_belts })}
            setErrorMessage={setErrorMessage}
        />
    </>;
}

function SkillDomainsView() {
    const { t } = useTranslation();
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
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem active href="/skill-domains">{t('skill_domain.list.title.primary')}</BreadcrumbItem>
            </Breadcrumb>
            <h3>{t('skill_domain.list.title.primary')}</h3>
            {errorMessage ? <Alert variant="danger">{t('error')}: {errorMessage}</Alert> : <Loader />}
        </>;
    }

    const { skill_domains } = skillDomainList;
    const sorted_skill_domains = skill_domains.sort((a, b) => a.name.localeCompare(b.name));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
            <BreadcrumbItem active href="/skill-domains">{t('skill_domain.list.title.primary')}</BreadcrumbItem>
        </Breadcrumb>
        <h3>{t('skill_domain.list.title.primary')}</h3>
        <AdminOnly>
            <CreateSkillDomainButton createdCallback={new_skill_domain => {
                setSkillDomainList({ ...skillDomainList, skill_domains: [...skill_domains, new_skill_domain] });
            }}/>
        </AdminOnly>
        <h4>{t('skill_domain.list.title.secondary')}</h4>
        <SkillDomainListing
            skill_domains={sorted_skill_domains}
            setSkillDomains={new_skill_domains => setSkillDomainList({ ...skillDomainList, skill_domains: new_skill_domains })}
        />
    </>;
}

function ClassLevelsView() {
    if (!is_admin()) {
        return null;
    }

    const { t } = useTranslation();
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
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem active href="/class-levels">{t('class_level.list.title.primary')}</BreadcrumbItem>
            </Breadcrumb>
            <h3>{t('class_level.list.title.primary')}</h3>
            {errorMessage ? <Alert variant="danger">{t('error')}: {errorMessage}</Alert> : <Loader />}
        </>;
    }

    const { class_levels } = classLevelList;
    const sorted_class_levels = class_levels.sort((a, b) => a.prefix.localeCompare(b.prefix));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
            <BreadcrumbItem active href="/class-levels">{t('class_level.list.title.primary')}</BreadcrumbItem>
        </Breadcrumb>
        <h3>{t('class_level.list.title.primary')}</h3>
        <AdminOnly>
            <CreateClassLevelButton createdCallback={new_class_level => {
                setClassLevelList({ ...classLevelList, class_levels: [...class_levels, new_class_level] });
            }} />
        </AdminOnly>
        <h4>{t('class_level.list.title.secondary')}</h4>
        <ClassLevelListing
            class_levels={sorted_class_levels}
            setClassLevels={new_class_levels => setClassLevelList({ ...classLevelList, class_levels: new_class_levels })}
        />
    </>;
}

function ClassLevelView() {
    if (!is_admin()) {
        return null;
    }

    const params = useParams();
    if (params.class_level_id === undefined) {
        // should not happen
        console.error('Attribute class_level_id of <ClassLevelView /> is undefined');
        return null;
    }
    const class_level_id = params.class_level_id;

    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [schoolClassList, setSchoolClassList] = useState<null | SchoolClassList>(null);
    const navigate = useNavigate();

    useEffect(() => {
        ClassLevelsService
            .getClassLevelResource(parseInt(class_level_id))
            .then(setSchoolClassList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
    }, [class_level_id]);

    if (schoolClassList === null) {
        return <>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem href="/class-levels">{t('class_level.list.title.primary')}</BreadcrumbItem>
                <BreadcrumbItem active href={'/class-levels/' + class_level_id}>{t('class_level.view.title')} ?</BreadcrumbItem>
            </Breadcrumb>
            <h3>{t('class_level.view.title')}: ?</h3>
            {errorMessage ? <Alert variant="danger">{t('error')}: {errorMessage}</Alert> : <Loader />}
        </>;
    }

    const { class_level, school_classes } = schoolClassList;
    const sorted_school_classes = school_classes.sort((a, b) => a.suffix.localeCompare(b.suffix));

    return <>
        <Breadcrumb>
            <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
            <BreadcrumbItem href="/class-levels">{t('class_level.list.title.primary')}</BreadcrumbItem>
            <BreadcrumbItem active href={'/class-levels/' + class_level.id}>{t('class_level.view.title')} {class_level.prefix}</BreadcrumbItem>
        </Breadcrumb>
        <h3>{t('class_level.view.title')}: {class_level.prefix}</h3>
        <AdminOnly>
            <EditClassLevelButton class_level={class_level} changedCallback={new_class_level => {
                setSchoolClassList({ ...schoolClassList, class_level: new_class_level });
            }} />
            {' '}
            <DeleteClassLevelButton class_level={class_level} deletedCallback={() => navigate('/class-levels')} />
        </AdminOnly>
        <h4>{t('school_class.list.title.secondary')}</h4>
        <AdminOnly>
            <CreateSchoolClassButton
                class_level={class_level}
                createdCallback={new_school_class => {
                    setSchoolClassList({ ...schoolClassList, school_classes: [...school_classes, new_school_class] });
                }}
            />
        </AdminOnly>
        <SchoolClassListing
            class_level={class_level}
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
        return null;
    }
    const school_class_id = params.school_class_id;

    const loginInfo = React.useContext(LoginContext);
    if (loginInfo === null) {
        // not connected
        return null;
    }
    const canUseWaitlist = loginInfo.user.is_admin;

    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [studentList, setStudentList] = useState<null | StudentList>(null);
    const [waitlistEntryList, setWaitlistEntryList] = useState<null | WaitlistEntryList>(null);
    const navigate = useNavigate();

    useEffect(() => {
        SchoolClassesService
            .getSchoolClassResource(parseInt(school_class_id))
            .then(setStudentList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
        if (canUseWaitlist) {
            SchoolClassesService
                .getSchoolClassWaitlistResource(parseInt(school_class_id))
                .then(setWaitlistEntryList)
                .catch(error => { setErrorMessage(getAPIError(error)); });
        }
    }, [school_class_id]);

    if (studentList === null || (canUseWaitlist && waitlistEntryList === null)) {
        return <>
            <AdminOnly>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem href="/class-levels">{t('class_level.list.title.primary')}</BreadcrumbItem>
                    <BreadcrumbItem>{t('class_level.view.title')} ?</BreadcrumbItem>
                    <BreadcrumbItem active href="/">{t('school_class.view.title')} ?</BreadcrumbItem>
                </Breadcrumb>
            </AdminOnly>
            <h3>{t('school_class.view.title')}: ?</h3>
            {errorMessage ? <Alert variant="danger">{t('error')}: {errorMessage}</Alert> : <Loader />}
        </>;
    }

    const { belts, skill_domains, class_level, school_class, students, student_belts } = studentList;

    return <>
        <AdminOnly>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem href="/class-levels">{t('class_level.list.title.primary')}</BreadcrumbItem>
                <BreadcrumbItem href={'/class-levels/' + class_level.id}>{t('class_level.view.title')} {class_level.prefix}</BreadcrumbItem>
                <BreadcrumbItem active href={'/school-classes/' + school_class.id}>{t('school_class.view.title')} {school_class.suffix}</BreadcrumbItem>
            </Breadcrumb>
        </AdminOnly>
        <h3>{t('school_class.view.title')}: {class_level.prefix}{school_class.suffix}</h3>
        <AdminOnly>
            {waitlistEntryList &&
                <SchoolClassWaitlist
                    students={students}
                    skill_domains={skill_domains}
                    belts={belts}
                    waitlist_entries={waitlistEntryList.waitlist_entries}
                />
            }
            <EditSchoolClassButton
                class_level={class_level}
                school_class={school_class}
                changedCallback={new_school_class => {
                    setStudentList({ ...studentList, school_class: new_school_class });
                }}
            />
            {' '}
            <DeleteSchoolClassButton
                class_level={class_level}
                school_class={school_class}
                deletedCallback={() => navigate('/class-levels/' + class_level.id)}
            />
            <h4>{t('student.list.title.secondary')}</h4>
            <CreateStudentButton
                school_class={school_class}
                class_level={class_level}
                createdCallback={new_student => {
                    setStudentList({ ...studentList, students: [...students, new_student] });
                }}
            />
            {' '}
            <UpdateStudentRanks students={students} changedCallback={new_students => {
                setStudentList({ ...studentList, students: new_students });
            }} />
            {' '}
            {waitlistEntryList &&
                <ManageClassWaitlist
                    class_level={class_level}
                    school_class={school_class}
                    students={students}
                    skill_domains={skill_domains}
                    belts={belts}
                    student_belts={student_belts}
                    waitlistEntryList={waitlistEntryList}
                    setWaitlistEntryList={setWaitlistEntryList}
                />
            }
        </AdminOnly>
        <EvaluationGrid
            students={students}
            setStudents={new_students => setStudentList({ ...studentList, students: new_students })}
            skill_domains={skill_domains}
            belts={belts}
            student_belts={student_belts}
        />
    </>;
}

interface StudentWidgetProps {
    student_id: number,
}

function StudentWidget(props: StudentWidgetProps) {
    const { student_id } = props;

    const loginInfo = React.useContext(LoginContext);
    if (loginInfo === null) {
        return null;
    }
    const canUseWaitlist = loginInfo.user.is_admin || loginInfo.student?.id == student_id;

    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [evaluationList, setEvaluationList] = useState<null | EvaluationList>(null);
    const [waitlistEntryList, setWaitlistEntryList] = useState<null | WaitlistEntryList>(null);
    const navigate = useNavigate();

    useEffect(() => {
        StudentsService
            .getStudentEvaluationsResource(student_id)
            .then(setEvaluationList)
            .catch(error => { setErrorMessage(getAPIError(error)); });
        if (canUseWaitlist) {
            StudentsService
                .getStudentWaitlistResource(student_id)
                .then(setWaitlistEntryList)
                .catch(error => { setErrorMessage(getAPIError(error)); });
        }
    }, [student_id]);

    if (evaluationList === null || (canUseWaitlist && waitlistEntryList === null)) {
        return <>
            <AdminOnly>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem href="/class-levels">{t('class_level.list.title.primary')}</BreadcrumbItem>
                    <BreadcrumbItem>{t('class_level.view.title')} ?</BreadcrumbItem>
                    <BreadcrumbItem active href="/">{t('school_class.view.title')} ?</BreadcrumbItem>
                    <BreadcrumbItem active href={'/students/' + student_id}>{t('student.view.title')} ?</BreadcrumbItem>
                </Breadcrumb>
            </AdminOnly>
            <h3>{t('student.view.title')}: ?</h3>
            {errorMessage ? <Alert variant="danger">{t('error')}: {errorMessage}</Alert> : <Loader />}
        </>;
    }

    // skill domains and belts must be fetched separately to make sure we have them all
    const { belts, skill_domains, class_level, school_class, student, evaluations } = evaluationList;

    const sorted_skill_domains = skill_domains.sort((a, b) => a.name.localeCompare(b.name));

    return <>
        <AdminOnly>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem href="/class-levels">{t('class_level.list.title.primary')}</BreadcrumbItem>
                <BreadcrumbItem href={'/class-levels/' + class_level.id}>{t('class_level.view.title')} {class_level.prefix}</BreadcrumbItem>
                <BreadcrumbItem active href={'/school-classes/' + school_class.id}>{t('school_class.view.title')} {school_class.suffix}</BreadcrumbItem>
                <BreadcrumbItem active href={'/students/' + student.id}>{t('student.view.title')} {student.display_name}</BreadcrumbItem>
            </Breadcrumb>
        </AdminOnly>
        <h3>{t('student.view.title')}: {student.display_name}</h3>
        {t('student.view.school_class')}:
        {' '}
        <Link to={'/school-classes/' + school_class.id}>
            {class_level.prefix}{school_class.suffix}
        </Link>
        <AdminOnly>
            <br />
            <EditStudentButton student={student} changedCallback={new_student => {
                setEvaluationList({ ...evaluationList, student: new_student });
            }} />
            {' '}
            <DeleteStudentButton student={student} deletedCallback={() => navigate('/school-classes/' + school_class.id)} />
        </AdminOnly>
        <h4>{t('student.belts.title')}</h4>
        <StudentBelts
            skill_domains={sorted_skill_domains}
            belts={belts}
            student={student}
            evaluations={evaluations}
            canUseWaitlist={canUseWaitlist}
            waitlist_entries={waitlistEntryList?.waitlist_entries || []}
            setWaitlistEntries={new_waitlist_entries => {
                if (waitlistEntryList) {
                    setWaitlistEntryList({ ...waitlistEntryList, waitlist_entries: new_waitlist_entries});
                }
            }}
        />
        <h4>{t('evaluation.list.title.secondary')}</h4>
        <AdminOnly>
            <CreateEvaluationButton student={student} skill_domains={skill_domains} belts={belts} createdCallback={new_evaluation => {
                setEvaluationList({ ...evaluationList, evaluations: [...evaluations, new_evaluation] });
            }} />
        </AdminOnly>
        <EvaluationListing
            skill_domains={skill_domains}
            belts={belts}
            student={student}
            evaluations={evaluations}
            setEvaluations={new_evaluations => setEvaluationList({ ...evaluationList, evaluations: new_evaluations })}
        />
    </>;
}

function StudentView() {
    const params = useParams();
    if (params.student_id === undefined) {
        // should not happen
        console.error('Attribute student_id of <StudentView /> is undefined');
        return null;
    }
    const student_id = parseInt(params.student_id);
    return <StudentWidget student_id={student_id} />;
}

function LanguageSelector() {
    const currentLanguageCode = i18n.language;
    const otherLanguageCode = currentLanguageCode == 'en' ? 'fr' : 'en';

    const languageEmojis = {
        'en': '🇬🇧',
        'fr': '🇫🇷',
    };
    const otherLanguageEmoji = languageEmojis[otherLanguageCode];

    return <Button onClick={() => i18n.changeLanguage(otherLanguageCode)}>{otherLanguageEmoji}</Button>;
}

function NotFound() {
    const { t } = useTranslation();
    return (
        <Alert variant="warning">
            {t('not_found')}
        </Alert>
    );
}

function Layout() {
    const { t } = useTranslation();

    const rawSavedLoginInfo = localStorage.getItem('login_info');
    const savedLoginInfo = rawSavedLoginInfo === null ? null : (JSON.parse(rawSavedLoginInfo) as LoginInfo);
    const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(savedLoginInfo);
    const [loginMessage, setLoginMessage] = useState('');
    if (loginInfo === null) {
        OpenAPI.TOKEN = undefined;
        localStorage.removeItem('login_info');
        return <LoginFormWidget loggedInCallback={setLoginInfo} infoMessage={loginMessage} />;
    }

    OpenAPI.TOKEN = loginInfo.token;
    localStorage.setItem('login_info', JSON.stringify(loginInfo));
    (OpenAPI as OpenAPIWithCallback).ERROR_CALLBACK = (status: number) => {
        if (status === 401) {
            setLoginInfo(null);
            setLoginMessage(t('expired_token'));
            return true;
        }
        return false;
    };

    const missing_i18n_key_events_since_last_login = loginInfo.missing_i18n_key_events_since_last_login;

    return <LoginContext.Provider value={loginInfo}>
        <Navbar>
            <Navbar.Brand as={Link} to="/">{t('main_title')}</Navbar.Brand>
            <Nav className="me-auto">
                <Nav.Item><Nav.Link as={Link} to="/">{t('home_page')}</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={Link} to="/skill-domains">{t('skill_domain.list.title.primary')}</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link as={Link} to="/belts">{t('belt.list.title.primary')}</Nav.Link></Nav.Item>
                <AdminOnly>
                    <Nav.Item><Nav.Link as={Link} to="/class-levels">{t('class_level.list.title.primary')}</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link as={Link} to="/users">{t('user.list.title.primary')}</Nav.Link></Nav.Item>
                    <Nav.Item><Nav.Link as={Link} to="/i18n">i18n</Nav.Link></Nav.Item>
                </AdminOnly>
            </Nav>
            {loginInfo.student ? <Badge bg="info" className="me-2">{loginInfo.student.display_name}</Badge> : null}
            <LanguageSelector />
            <Badge bg="info" className="me-2">{loginInfo.user.username}</Badge>
            <LogoutButton className="me-2" loggedOutCallback={() => setLoginInfo(null)}/>
        </Navbar>
        {missing_i18n_key_events_since_last_login &&
            <Alert variant="danger">
                {t('missing_i18n_keys', missing_i18n_key_events_since_last_login)}
            </Alert>
        }
        <Outlet />
    </LoginContext.Provider>;
}

function App() {
    return <Routes>
        <Route path="/" element={<Layout />}>
            <Route path="" element={<HomeView />} />
            <Route path="i18n" element={<I18nView />} />
            <Route path="users" element={<UsersView />} />
            <Route path="belts" element={<BeltsView />} />
            <Route path="skill-domains" element={<SkillDomainsView />} />
            <Route path="class-levels">
                <Route index element={<ClassLevelsView />} />
                <Route path=":class_level_id" element={<ClassLevelView />} />
            </Route>
            <Route path="school-classes/:school_class_id" element={<SchoolClassView />} />
            <Route path="students/:student_id" element={<StudentView />} />
            <Route path="*" element={<NotFound />} />
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
