import React from 'react';
import { Dispatch, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';

import { Level, Class } from './api';
import { AdminOnly } from './auth';
import ClassEditButton from './ClassEditButton';
import ClassDeleteButton from './ClassDeleteButton';

interface RowProps {
    level: Level;
    class: Class;
    setClasses: Dispatch<
        (prevClasses: Class[]) => Class[]
    >;
}

function ClassRow_(props: RowProps) {
    const { level, class: class_, setClasses } = props;

    const changedCallback = (nextClass: Class) =>
        setClasses((prevClasses) => {
            const index = prevClasses.findIndex(
                (otherClass) => otherClass.id === nextClass.id
            );
            if (index === null) {
                return prevClasses;
            }
            const nextClasses = [...prevClasses];
            nextClasses[index] = nextClass;
            return nextClasses;
        });

    const deletedCallback = (class_id: number) =>
        setClasses((prevClasses) => {
            const index = prevClasses.findIndex(
                (otherClass) => otherClass.id === class_id
            );
            if (index === null) {
                return prevClasses;
            }
            const nextClasses = [...prevClasses];
            nextClasses.splice(index, 1);
            return nextClasses;
        });

    return (
        <tr key={class_.id}>
            <td>
                <Nav.Link as={Link} to={'/classes/' + class_.id}>
                    {class_.name}
                </Nav.Link>
            </td>
            <AdminOnly>
                <td>
                    <ClassEditButton
                        level={level}
                        class={class_}
                        changedCallback={changedCallback}
                    />{' '}
                    <ClassDeleteButton
                        level={level}
                        class={class_}
                        deletedCallback={deletedCallback}
                    />
                </td>
            </AdminOnly>
        </tr>
    );
}

const ClassRow = React.memo(ClassRow_);

interface Props {
    level: Level;
    classes: Class[];
    setClasses: Dispatch<
        (prevClasses: Class[]) => Class[]
    >;
}

export default function ClassListing(props: Props): ReactElement {
    const { level, classes, setClasses } = props;
    const { t } = useTranslation();
    return (
        <>
            <Table>
                <thead>
                    <tr>
                        <th>{t('class.list.name.title')}</th>
                        <AdminOnly>
                            <th>{t('class.list.actions.title')}</th>
                        </AdminOnly>
                    </tr>
                </thead>
                <tbody>
                    {classes.map((class_) => (
                        <ClassRow
                            key={class_.id}
                            level={level}
                            class={class_}
                            setClasses={setClasses}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    );
}
