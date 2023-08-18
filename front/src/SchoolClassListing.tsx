import React from 'react';
import { Dispatch, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';

import { ClassLevel, SchoolClass } from './api';
import { AdminOnly } from './auth';
import SchoolClassEditButton from './SchoolClassEditButton';
import SchoolClassDeleteButton from './SchoolClassDeleteButton';

interface RowProps {
    class_level: ClassLevel;
    school_class: SchoolClass;
    setSchoolClasses: Dispatch<
        (prevSchoolClasses: SchoolClass[]) => SchoolClass[]
    >;
}

function SchoolClassRow_(props: RowProps) {
    const { class_level, school_class, setSchoolClasses } = props;

    const changedCallback = (nextSchoolClass: SchoolClass) =>
        setSchoolClasses((prevSchoolClasses) => {
            const index = prevSchoolClasses.findIndex(
                (otherSchoolClass) => otherSchoolClass.id === nextSchoolClass.id
            );
            if (index === null) {
                return prevSchoolClasses;
            }
            const nextSchoolClasses = [...prevSchoolClasses];
            nextSchoolClasses[index] = nextSchoolClass;
            return nextSchoolClasses;
        });

    const deletedCallback = (school_class_id: number) =>
        setSchoolClasses((prevSchoolClasses) => {
            const index = prevSchoolClasses.findIndex(
                (otherSchoolClass) => otherSchoolClass.id === school_class_id
            );
            if (index === null) {
                return prevSchoolClasses;
            }
            const nextSchoolClasses = [...prevSchoolClasses];
            nextSchoolClasses.splice(index, 1);
            return nextSchoolClasses;
        });

    return (
        <tr key={school_class.id}>
            <td>
                <Nav.Link as={Link} to={'/school-classes/' + school_class.id}>
                    {school_class.suffix}
                </Nav.Link>
            </td>
            <AdminOnly>
                <td>
                    <SchoolClassEditButton
                        class_level={class_level}
                        school_class={school_class}
                        changedCallback={changedCallback}
                    />{' '}
                    <SchoolClassDeleteButton
                        class_level={class_level}
                        school_class={school_class}
                        deletedCallback={deletedCallback}
                    />
                </td>
            </AdminOnly>
        </tr>
    );
}

const SchoolClassRow = React.memo(SchoolClassRow_);

interface Props {
    class_level: ClassLevel;
    school_classes: SchoolClass[];
    setSchoolClasses: Dispatch<
        (prevSchoolClasses: SchoolClass[]) => SchoolClass[]
    >;
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
                    {school_classes.map((school_class) => (
                        <SchoolClassRow
                            key={school_class.id}
                            class_level={class_level}
                            school_class={school_class}
                            setSchoolClasses={setSchoolClasses}
                        />
                    ))}
                </tbody>
            </Table>
        </>
    );
}
