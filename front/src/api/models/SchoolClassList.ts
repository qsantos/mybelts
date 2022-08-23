/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { ClassLevel } from './ClassLevel';
import type { SchoolClass } from './SchoolClass';
import type { SkillDomain } from './SkillDomain';

export type SchoolClassList = {
    belts: Array<Belt>;
    class_level: ClassLevel;
    school_classes: Array<SchoolClass>;
    skill_domains: Array<SkillDomain>;
}
