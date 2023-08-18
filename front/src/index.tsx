import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Outlet, Route, Routes } from 'react-router-dom';
import React from 'react';
import { ReactElement, ReactNode, StrictMode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Spinner from 'react-bootstrap/Spinner';

import './i18n';
import { OpenAPI, LoginInfo } from './api';
import { OpenAPIWithCallback } from './api/core/request';
import { formatDatetime } from './lib';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { AdminOnly, LoginFormWidget, LogoutButton, LoginContext } from './auth';
import I18nView from './I18nView';
import UsersView from './UsersView';
import BeltsView from './BeltsView';
import SkillDomainsView from './SkillDomainsView';
import ClassLevelsView from './ClassLevelsView';
import ClassLevelView from './ClassLevelView';
import SchoolClassView from './SchoolClassView';
import StudentWidget from './StudentWidget';
import StudentView from './StudentView';

class AssertionError extends Error {}

export function assert(condition: boolean, msg?: string): asserts condition {
    if (!condition) {
        throw new AssertionError(msg);
    }
}

export function BreadcrumbItem({
    children,
    href,
    active,
}: {
    children: ReactNode;
    href?: string;
    active?: boolean;
}): ReactElement {
    if (href) {
        return (
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: href }}>
                {children}
            </Breadcrumb.Item>
        );
    } else {
        return (
            <Breadcrumb.Item active={active === undefined ? false : active}>
                {children}
            </Breadcrumb.Item>
        );
    }
}

export function Loader(): ReactElement {
    const { t } = useTranslation();
    return (
        <Spinner animation="border" role="status">
            <span className="visually-hidden">{t('loading')}</span>
        </Spinner>
    );
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
        return (
            <>
                Hello {user.username}. You last logged in on{' '}
                {formatDatetime(user.last_login)}.
            </>
        );
    } else {
        // other
        return <>Hello {user.username}</>;
    }
}

function LanguageSelector() {
    const currentLanguageCode = i18n.language;
    const otherLanguageCode = currentLanguageCode === 'en' ? 'fr' : 'en';

    const languageEmojis = {
        en: '🇬🇧',
        fr: '🇫🇷',
    };
    const otherLanguageEmoji = languageEmojis[otherLanguageCode];

    return (
        <Button onClick={() => i18n.changeLanguage(otherLanguageCode)}>
            {otherLanguageEmoji}
        </Button>
    );
}

function NotFound() {
    const { t } = useTranslation();
    return <Alert variant="warning">{t('not_found')}</Alert>;
}

function Layout() {
    const { t } = useTranslation();

    const rawSavedLoginInfo = localStorage.getItem('login_info');
    const savedLoginInfo =
        rawSavedLoginInfo === null
            ? null
            : (JSON.parse(rawSavedLoginInfo) as LoginInfo);
    const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(
        savedLoginInfo
    );
    const [loginMessage, setLoginMessage] = useState('');

    // NOTE: always reset this, to make sure it is actually cleared when login out
    (OpenAPI as OpenAPIWithCallback).ERROR_CALLBACK = undefined;

    if (loginInfo === null) {
        OpenAPI.TOKEN = undefined;
        localStorage.removeItem('login_info');
        return (
            <LoginFormWidget
                loggedInCallback={setLoginInfo}
                infoMessage={loginMessage}
            />
        );
    }
    if (loginInfo.payload?.exp <= Date.now() / 1000) {
        setLoginInfo(null);
        return null;
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

    const missing_i18n_key_events_since_last_login =
        loginInfo.missing_i18n_key_events_since_last_login;

    return (
        <LoginContext.Provider value={loginInfo}>
            <Navbar>
                <Navbar.Brand as={Link} to="/">
                    {t('main_title')}
                </Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Item>
                        <Nav.Link as={Link} to="/">
                            {t('home_page')}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={Link} to="/skill-domains">
                            {t('skill_domain.list.title.primary')}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link as={Link} to="/belts">
                            {t('belt.list.title.primary')}
                        </Nav.Link>
                    </Nav.Item>
                    <AdminOnly>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/class-levels">
                                {t('class_level.list.title.primary')}
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/users">
                                {t('user.list.title.primary')}
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/i18n">
                                i18n
                            </Nav.Link>
                        </Nav.Item>
                    </AdminOnly>
                </Nav>
                {loginInfo.student ? (
                    <Badge bg="info" className="me-2">
                        {loginInfo.student.display_name}
                    </Badge>
                ) : null}
                <LanguageSelector />
                <Badge bg="info" className="me-2">
                    {loginInfo.user.username}
                </Badge>
                <LogoutButton
                    className="me-2"
                    loggedOutCallback={() => setLoginInfo(null)}
                />
            </Navbar>
            {missing_i18n_key_events_since_last_login && (
                <Alert variant="danger">
                    {t(
                        'missing_i18n_keys',
                        missing_i18n_key_events_since_last_login
                    )}
                </Alert>
            )}
            <Outlet />
        </LoginContext.Provider>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="" element={<HomeView />} />
                <Route
                    path="i18n"
                    element={
                        <AdminOnly>
                            <I18nView />
                        </AdminOnly>
                    }
                />
                <Route
                    path="users"
                    element={
                        <AdminOnly>
                            <UsersView />
                        </AdminOnly>
                    }
                />
                <Route path="belts" element={<BeltsView />} />
                <Route path="skill-domains" element={<SkillDomainsView />} />
                <Route path="class-levels">
                    <Route
                        index
                        element={
                            <AdminOnly>
                                <ClassLevelsView />
                            </AdminOnly>
                        }
                    />
                    <Route
                        path=":class_level_id"
                        element={
                            <AdminOnly>
                                <ClassLevelView />
                            </AdminOnly>
                        }
                    />
                </Route>
                <Route
                    path="school-classes/:school_class_id"
                    element={<SchoolClassView />}
                />
                <Route path="students/:student_id" element={<StudentView />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

ReactDOM.render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
    document.getElementById('root')
);
