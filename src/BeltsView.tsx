import React from 'react';
import { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { BeltList, BeltsService } from './api';
import { getAPIError } from './lib';
import { AdminOnly } from './auth';
import BeltListing from './BeltListing';
import BeltCreateButton from './BeltCreateButton';
import { BreadcrumbItem, Loader } from './index';

export default function BeltsView(): ReactElement {
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [beltList, setBeltList] = useState<null | BeltList>(null);

    useEffect(() => {
        BeltsService.getBeltsResource()
            .then(setBeltList)
            .catch((error) => {
                setErrorMessage(getAPIError(error));
            });
    }, []);

    if (beltList === null) {
        return (
            <>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem active href="/belts">
                        {t('belt.list.title.primary')}
                    </BreadcrumbItem>
                </Breadcrumb>
                <h3>{t('belt.list.title.primary')}</h3>
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

    const { belts } = beltList;

    const sorted_belts = belts.sort((a, b) => a.rank - b.rank);
    // TODO: handle case where result is false
    sorted_belts.reduce((previous, belt, index) => {
        if (belt.rank !== index + 1) {
            console.error('Inconsistent ranking of belts ' + belt.id + '!');
            return false;
        }
        return previous;
    }, true);

    return (
        <>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem active href="/belts">
                    {t('belt.list.title.primary')}
                </BreadcrumbItem>
            </Breadcrumb>
            <h3>{t('belt.list.title.primary')}</h3>
            {errorMessage && (
                <Alert variant="danger">
                    {t('error')}: {errorMessage}
                </Alert>
            )}
            <AdminOnly>
                <BeltCreateButton
                    createdCallback={(new_belt) => {
                        setBeltList({
                            ...beltList,
                            belts: [...belts, new_belt],
                        });
                    }}
                />
            </AdminOnly>
            <h4>{t('belt.list.title.secondary')}</h4>
            <BeltListing
                belts={sorted_belts}
                setBelts={(new_belts) =>
                    setBeltList({ ...beltList, belts: new_belts })
                }
                setErrorMessage={setErrorMessage}
            />
        </>
    );
}
