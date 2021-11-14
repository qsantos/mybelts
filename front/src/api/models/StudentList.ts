/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ClassLevel } from './ClassLevel';
import type { SchoolClass } from './SchoolClass';
import type { Student } from './Student';

export type StudentList = {
    class_level: ClassLevel;
    school_class: SchoolClass;
    students: Array<Student>;
}
