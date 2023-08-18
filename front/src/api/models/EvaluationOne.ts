/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { ClassLevel } from './ClassLevel';
import type { Evaluation } from './Evaluation';
import type { SchoolClass } from './SchoolClass';
import type { SkillDomain } from './SkillDomain';
import type { Student } from './Student';

export type EvaluationOne = {
    belt: Belt;
    class_level: ClassLevel;
    evaluation: Evaluation;
    school_class: SchoolClass;
    skill_domain: SkillDomain;
    student: Student;
}
