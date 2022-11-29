import React from 'react';
import { ReactElement } from 'react';
import Form from 'react-bootstrap/Form';

import { Student, StudentsService } from './api';
import { ModalButton } from './ModalButton';

interface Props {
    students: Student[];
    changedCallback?: (changed_students: Student[]) => void;
}

export function StudentUpdateRanks(props: Props): ReactElement {
    const { students, changedCallback } = props;

    return (
        <ModalButton
            i18nPrefix="student.update_ranks"
            onSubmit={(form: EventTarget) => {
                const typed_form = form as typeof form & {
                    rank: HTMLInputElement[];
                };
                const inputElements = [...typed_form.rank];
                const new_student_ranks = inputElements.map(
                    (inputElement: HTMLInputElement) => {
                        return {
                            id: parseInt(
                                inputElement.getAttribute('data-student-id') ||
                                    '0'
                            ),
                            rank: parseInt(inputElement.value || '0'),
                        };
                    }
                );
                return StudentsService.putStudentsResource({
                    students: new_student_ranks,
                });
            }}
            onResponse={({ students: changed_students }) =>
                changedCallback?.(changed_students)
            }
        >
            {students.map((student) => (
                <Form.Group controlId="rank" key={student.id} className="mb-3">
                    <Form.Label>{student.display_name}</Form.Label>
                    <Form.Control
                        type="number"
                        defaultValue={student.rank}
                        data-student-id={student.id}
                    />
                </Form.Group>
            ))}
        </ModalButton>
    );
}
