/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { Evaluation } from './Evaluation';
import type { Level } from './Level';
import type { SchoolClass } from './SchoolClass';
import type { SkillDomain } from './SkillDomain';
import type { Student } from './Student';

export type EvaluationList = {
    belts: Array<Belt>;
    evaluations: Array<Evaluation>;
    level: Level;
    school_class: SchoolClass;
    skill_domains: Array<SkillDomain>;
    student: Student;
}
