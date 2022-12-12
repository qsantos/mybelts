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
    index: number;
    class_level: ClassLevel;
    school_class: SchoolClass;
    setSchoolClasses: Dispatch<
        (prevSchoolClasses: SchoolClass[]) => SchoolClass[]
    >;
}

function SchoolClassRow_(props: RowProps) {
    const { index, class_level, school_class, setSchoolClasses } = props;

    const changedCallback = (nextSchoolClass: SchoolClass) =>
        setSchoolClasses((prevSchoolClasses) => {
            const nextSchoolClasses = [...prevSchoolClasses];
            nextSchoolClasses[index] = nextSchoolClass;
            return nextSchoolClasses;
        });

    const deletedCallback = () =>
        setSchoolClasses((prevSchoolClasses) => {
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
                    {school_classes.map((school_class, index) => (
                        <SchoolClassRow
                            key={school_class.id}
                            index={index}
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
