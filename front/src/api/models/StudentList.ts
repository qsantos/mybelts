/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { Level } from './Level';
import type { SchoolClass } from './SchoolClass';
import type { SchoolClassStudentBeltsStudentBelts } from './SchoolClassStudentBeltsStudentBelts';
import type { SkillDomain } from './SkillDomain';
import type { Student } from './Student';

export type StudentList = {
    belts: Array<Belt>;
    level: Level;
    school_class: SchoolClass;
    skill_domains: Array<SkillDomain>;
    student_belts: Array<SchoolClassStudentBeltsStudentBelts>;
    students: Array<Student>;
}
