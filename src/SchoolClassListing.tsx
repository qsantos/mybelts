import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';

import { ClassLevel, SchoolClass } from './api';
import { AdminOnly } from './auth';
import SchoolClassEditButton from './SchoolClassEditButton';
import SchoolClassDeleteButton from './SchoolClassDeleteButton';

interface Props {
    class_level: ClassLevel;
    school_classes: SchoolClass[];
    setSchoolClasses: (school_classes: SchoolClass[]) => void;
}

export default function SchoolClassListing(props: Props): ReactElement {
    const { class_level, school_classes, setSchoolClasses } = props;
    const { t } = useTranslation();
    return (
        <>
            <Table>
                <thead>
                    <tr>
                        <th>{t('school_class.list.suffix.title')}</th>
                        <AdminOnly>
                            <th>{t('school_class.list.actions.title')}</th>
                        </AdminOnly>
                    </tr>
                </thead>
                <tbody>
                    {school_classes.map((school_class, index) => (
                        <tr key={school_class.id}>
                            <td>
                                <Nav.Link
                                    as={Link}
                                    to={'/school-classes/' + school_class.id}
                                >
                                    {school_class.suffix}
                                </Nav.Link>
                            </td>
                            <AdminOnly>
                                <td>
                                    <SchoolClassEditButton
                                        class_level={class_level}
                                        school_class={school_class}
                                        changedCallback={(new_school_class) => {
                                            const new_school_classes = [
                                                ...school_classes,
                                            ];
                                            new_school_classes[index] =
                                                new_school_class;
                                            setSchoolClasses(
                                                new_school_classes
                                            );
                                        }}
                                    />{' '}
                                    <SchoolClassDeleteButton
                                        class_level={class_level}
                                        school_class={school_class}
                                        deletedCallback={() => {
                                            const new_school_classes = [
                                                ...school_classes,
                                            ];
                                            new_school_classes.splice(index, 1);
                                            setSchoolClasses(
                                                new_school_classes
                                            );
                                        }}
                                    />
                                </td>
                            </AdminOnly>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
}
