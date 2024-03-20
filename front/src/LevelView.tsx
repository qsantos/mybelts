import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Exam, Class, LevelsService, ClassList } from './api';
import { getAPIError } from './lib';
import { AdminOnly } from './auth';
import LevelDeleteButton from './LevelDeleteButton';
import LevelEditButton from './LevelEditButton';
import ClassListing from './ClassListing';
import ClassCreateButton from './ClassCreateButton';
import { assert, BreadcrumbItem, Loader } from './index';
import ExamsManager from './ExamsManager';

export default function LevelView(): ReactElement {
    const { level_id } = useParams();
    assert(level_id !== undefined);

    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [classList, setClassList] =
        useState<null | ClassList>(null);
    const navigate = useNavigate();

    const setClasses = useCallback(
        (
            setStateAction: (prevClasses: Class[]) => Class[]
        ) => {
            setClassList((prevClassList) => {
                if (prevClassList === null) {
                    return null;
                }
                const prevClasses = prevClassList.classes;
                const nextClasses = setStateAction(prevClasses);
                return {
                    ...prevClassList,
                    classes: nextClasses,
                };
            });
        },
        [setClassList]
    );

    const setExams = useCallback(
        (setStateAction: (prevExams: Exam[]) => Exam[]) => {
            setClassList((prevClassList) => {
                if (prevClassList === null) {
                    return null;
                }
                const prevExams = prevClassList.exams;
                const nextExams = setStateAction(prevExams);
                return {
                    ...prevClassList,
                    exams: nextExams,
                };
            });
        },
        [setClassList]
    );

    useEffect(() => {
        LevelsService.getLevelResource(parseInt(level_id))
            .then(setClassList)
            .catch((error) => {
                setErrorMessage(getAPIError(error));
            });
    }, [level_id]);

    if (classList === null) {
        return (
            <>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem href="/levels">
                        {t('level.list.title.primary')}
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        active
                        href={'/levels/' + level_id}
                    >
                        {t('level.view.title')} ?
                    </BreadcrumbItem>
                </Breadcrumb>
                <h3>{t('level.view.title')}: ?</h3>
                {errorMessage ? (
                    <Alert variant="danger">
                        {t('error')}: {errorMessage}
                    </Alert>
                ) : (
                    <Loader />
                )}
            </>
        );
    }

    const { belts, skill_domains, level, classes, exams } =
        classList;

    const sorted_classes = classes.sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    return (
        <>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem href="/levels">
                    {t('level.list.title.primary')}
                </BreadcrumbItem>
                <BreadcrumbItem active href={'/levels/' + level.id}>
                    {t('level.view.title')} {level.name}
                </BreadcrumbItem>
            </Breadcrumb>
            <h3>
                {t('level.view.title')}: {level.name}
            </h3>
            <AdminOnly>
                <LevelEditButton
                    level={level}
                    changedCallback={(new_level) => {
                        setClassList({
                            ...classList,
                            level: new_level,
                        });
                    }}
                />{' '}
                <LevelDeleteButton
                    level={level}
                    deletedCallback={() => navigate('/levels')}
                />
            </AdminOnly>
            <h4>{t('class.list.title.secondary')}</h4>
            <AdminOnly>
                <ClassCreateButton
                    level={level}
                    createdCallback={(new_class) => {
                        setClassList({
                            ...classList,
                            classes: [
                                ...classes,
                                new_class,
                            ],
                        });
                    }}
                />
            </AdminOnly>
            <ClassListing
                level={level}
                classes={sorted_classes}
                setClasses={setClasses}
            />
            <ExamsManager
                exams={exams}
                setExams={setExams}
                belts={belts}
                skill_domains={skill_domains}
                level={level}
            />
        </>
    );
}
