import { useParams } from 'react-router-dom';
import React from 'react';
import { ReactElement } from 'react';
import StudentWidget from './StudentWidget';

export default function StudentView(): ReactElement {
    const params = useParams();
    if (params.student_id === undefined) {
        // should not happen
        console.error('Attribute student_id of <StudentView /> is undefined');
        return <></>;
    }
    const student_id = parseInt(params.student_id);
    return <StudentWidget student_id={student_id} />;
}
