import React from 'react';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Level, LevelList, LevelsService } from './api';
import { getAPIError } from './lib';
import { AdminOnly } from './auth';
import LevelListing from './LevelListing';
import LevelCreateButton from './LevelCreateButton';
import { BreadcrumbItem, Loader } from './index';

export default function LevelsView(): ReactElement {
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [classLevelList, setLevelList] = useState<null | LevelList>(
        null
    );

    const setLevels = useCallback(
        (setStateAction: (prevLevels: Level[]) => Level[]) => {
            setLevelList((prevLevelList) => {
                if (prevLevelList === null) {
                    return null;
                }
                const prevLevels = prevLevelList.levels;
                const nextLevels = setStateAction(prevLevels);
                return {
                    ...prevLevelList,
                    levels: nextLevels,
                };
            });
        },
        [setLevelList]
    );

    useEffect(() => {
        LevelsService.getLevelsResource()
            .then(setLevelList)
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
                        {t('level.list.title.primary')}
                    </BreadcrumbItem>
                </Breadcrumb>
                <h3>{t('level.list.title.primary')}</h3>
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

    const { levels } = classLevelList;
    const sorted_levels = levels.sort((a, b) =>
        a.prefix.localeCompare(b.prefix)
    );

    return (
        <>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem active href="/class-levels">
                    {t('level.list.title.primary')}
                </BreadcrumbItem>
            </Breadcrumb>
            <h3>{t('level.list.title.primary')}</h3>
            <AdminOnly>
                <LevelCreateButton
                    createdCallback={(new_level) => {
                        setLevelList({
                            ...classLevelList,
                            levels: [...levels, new_level],
                        });
                    }}
                />
            </AdminOnly>
            <h4>{t('level.list.title.secondary')}</h4>
            <LevelListing
                levels={sorted_levels}
                setLevels={setLevels}
            />
        </>
    );
}
