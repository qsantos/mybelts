/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { BeltAttempt } from './BeltAttempt';
import type { ClassLevel } from './ClassLevel';
import type { SchoolClass } from './SchoolClass';
import type { SkillDomain } from './SkillDomain';
import type { Student } from './Student';

export type BeltAttemptList = {
    belt_attempts: Array<BeltAttempt>;
    belts: Array<Belt>;
    class_level: ClassLevel;
    school_class: SchoolClass;
    skill_domains: Array<SkillDomain>;
    student: Student;
}
