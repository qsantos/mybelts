import React from 'react';
import { Dispatch, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';

import { ClassLevel } from './api';
import { AdminOnly } from './auth';
import ClassLevelEditButton from './ClassLevelEditButton';
import ClassLevelDeleteButton from './ClassLevelDeleteButton';

interface RowProps {
    index: number;
    class_level: ClassLevel;
    setClassLevels: Dispatch<(prevClassLevels: ClassLevel[]) => ClassLevel[]>;
}

function ClassLevelRow_(props: RowProps) {
    const { index, class_level, setClassLevels } = props;

    const changedCallback = (nextClassLevel: ClassLevel) =>
        setClassLevels((prevClassLevels) => {
            const nextClassLevels = [...prevClassLevels];
            nextClassLevels[index] = nextClassLevel;
            return nextClassLevels;
        });

    const deletedCallback = () =>
        setClassLevels((prevClassLevels) => {
            const nextClasslevels = [...prevClassLevels];
            nextClasslevels.splice(index, 1);
            return nextClasslevels;
        });

    return (
        <tr key={class_level.id}>
            <td>
                <Nav.Link as={Link} to={'/class-levels/' + class_level.id}>
                    {class_level.prefix}
                </Nav.Link>
            </td>
            <AdminOnly>
                <td>
                    <ClassLevelEditButton
                        class_level={class_level}
                        changedCallback={changedCallback}
                    />{' '}
                    <ClassLevelDeleteButton
                        class_level={class_level}
                        deletedCallback={deletedCallback}
                    />
                </td>
            </AdminOnly>
        </tr>
    );
}

const ClassLevelRow = React.memo(ClassLevelRow_);

interface Props {
    class_levels: ClassLevel[];
    setClassLevels: Dispatch<(prevClassLevels: ClassLevel[]) => ClassLevel[]>;
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
                        <ClassLevelRow
                            key={class_level.id}
                            index={index}
                            class_level={class_level}
                            setClassLevels={setClassLevels}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    );
}
