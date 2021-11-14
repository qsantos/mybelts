/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { ClassLevel } from './ClassLevel';
import type { SchoolClass } from './SchoolClass';
import type { SchoolClassStudentBeltsStudentBelts } from './SchoolClassStudentBeltsStudentBelts';
import type { SkillDomain } from './SkillDomain';

export type SchoolClassStudentBelts = {
    belts: Array<Belt>;
    class_level: ClassLevel;
    school_class: SchoolClass;
    skill_domains: Array<SkillDomain>;
    student_belts: Array<SchoolClassStudentBeltsStudentBelts>;
}
