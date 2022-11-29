import React from 'react';
import { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { ClassLevelList, ClassLevelsService } from './api';
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
                setClassLevels={(new_class_levels) =>
                    setClassLevelList({
                        ...classLevelList,
                        class_levels: new_class_levels,
                    })
                }
            />
        </>
    );
}
