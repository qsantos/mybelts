/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { ClassLevel } from './ClassLevel';
import type { Exam } from './Exam';
import type { SchoolClass } from './SchoolClass';
import type { SkillDomain } from './SkillDomain';

export type SchoolClassList = {
    belts: Array<Belt>;
    class_level: ClassLevel;
    exams: Array<Exam>;
    school_classes: Array<SchoolClass>;
    skill_domains: Array<SkillDomain>;
}
