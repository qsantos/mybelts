import React from 'react';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { ClassLevel, ClassLevelList, ClassLevelsService } from './api';
import { getAPIError } from './lib';
import { AdminOnly } from './auth';
import ClassLevelListing from './ClassLevelListing';
import ClassLevelCreateButton from './ClassLevelCreateButton';
import { BreadcrumbItem, Loader } from './index';

export default function ClassLevelsView(): ReactElement {
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [classLevelList, setClassLevelList] = useState<null | ClassLevelList>(
        null
    );

    const setClassLevels = useCallback(
        (setStateAction: (prevClassLevels: ClassLevel[]) => ClassLevel[]) => {
            setClassLevelList((prevClassLevelList) => {
                if (prevClassLevelList === null) {
                    return null;
                }
                const prevClassLevels = prevClassLevelList.class_levels;
                const nextClassLevels = setStateAction(prevClassLevels);
                return {
                    ...prevClassLevelList,
                    class_levels: nextClassLevels,
                };
            });
        },
        [setClassLevelList]
    );

    useEffect(() => {
        ClassLevelsService.getClassLevelsResource()
            .then(setClassLevelList)
            .catch((error) => {
                setErrorMessage(getAPIError(error));
            });
    }, []);

    if (classLevelList === null) {
        return (
            <>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem active href="/class-levels">
                        {t('class_level.list.title.primary')}
                    </BreadcrumbItem>
                </Breadcrumb>
                <h3>{t('class_level.list.title.primary')}</h3>
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

    const { class_levels } = classLevelList;
    const sorted_class_levels = class_levels.sort((a, b) =>
        a.prefix.localeCompare(b.prefix)
    );

    return (
        <>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem active href="/class-levels">
                    {t('class_level.list.title.primary')}
                </BreadcrumbItem>
            </Breadcrumb>
            <h3>{t('class_level.list.title.primary')}</h3>
            <AdminOnly>
                <ClassLevelCreateButton
                    createdCallback={(new_class_level) => {
                        setClassLevelList({
                            ...classLevelList,
                            class_levels: [...class_levels, new_class_level],
                        });
                    }}
                />
            </AdminOnly>
            <h4>{t('class_level.list.title.secondary')}</h4>
            <ClassLevelListing
                class_levels={sorted_class_levels}
                setClassLevels={setClassLevels}
            />
        </>
    );
}
