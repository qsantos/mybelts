import React from 'react';
import { ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Table from 'react-bootstrap/Table';
import { DefaultService, MissingI18nKeyEventList } from './api';
import { getAPIError } from './lib';
import { BreadcrumbItem, Loader } from './index';

export function I18nView(): ReactElement {
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState('');
    const [eventList, setEventList] = useState<null | MissingI18nKeyEventList>(
        null
    );

    useEffect(() => {
        DefaultService.getMissingI18NKeyResource()
            .then(setEventList)
            .catch((error) => {
                setErrorMessage(getAPIError(error));
            });
    }, []);

    if (eventList === null) {
        return (
            <>
                <Breadcrumb>
                    <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                    <BreadcrumbItem active href="/i18n">
                        i18n
                    </BreadcrumbItem>
                </Breadcrumb>
                <h3>i18n</h3>
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

    const { events } = eventList;

    return (
        <>
            <Breadcrumb>
                <BreadcrumbItem href="/">{t('home_page')}</BreadcrumbItem>
                <BreadcrumbItem active href="/i18n">
                    i18n
                </BreadcrumbItem>
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
        </>
    );
}
