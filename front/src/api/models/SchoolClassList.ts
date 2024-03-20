/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { Exam } from './Exam';
import type { Level } from './Level';
import type { SchoolClass } from './SchoolClass';
import type { SkillDomain } from './SkillDomain';

export type SchoolClassList = {
    belts: Array<Belt>;
    exams: Array<Exam>;
    level: Level;
    school_classes: Array<SchoolClass>;
    skill_domains: Array<SkillDomain>;
}
