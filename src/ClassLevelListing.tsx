import React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';

import { ClassLevel } from './api';
import { AdminOnly } from './auth';
import ClassLevelEditButton from './ClassLevelEditButton';
import ClassLevelDeleteButton from './ClassLevelDeleteButton';

interface Props {
    class_levels: ClassLevel[];
    setClassLevels: (class_levels: ClassLevel[]) => void;
}

export default function ClassLevelListing(props: Props): ReactElement {
    const { class_levels, setClassLevels } = props;
    const { t } = useTranslation();
    return (
        <>
            <Table>
                <thead>
                    <tr>
                        <th>{t('class_level.list.prefix.title')}</th>
                        <AdminOnly>
                            <th>{t('class_level.list.actions.title')}</th>
                        </AdminOnly>
                    </tr>
                </thead>
                <tbody>
                    {class_levels.map((class_level, index) => (
                        <tr key={class_level.id}>
                            <td>
                                <Nav.Link
                                    as={Link}
                                    to={'/class-levels/' + class_level.id}
                                >
                                    {class_level.prefix}
                                </Nav.Link>
                            </td>
                            <AdminOnly>
                                <td>
                                    <ClassLevelEditButton
                                        class_level={class_level}
                                        changedCallback={(new_class_level) => {
                                            const new_class_levels = [
                                                ...class_levels,
                                            ];
                                            new_class_levels[index] =
                                                new_class_level;
                                            setClassLevels(new_class_levels);
                                        }}
                                    />{' '}
                                    <ClassLevelDeleteButton
                                        class_level={class_level}
                                        deletedCallback={() => {
                                            const new_class_levels = [
                                                ...class_levels,
                                            ];
                                            new_class_levels.splice(index, 1);
                                            setClassLevels(new_class_levels);
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
