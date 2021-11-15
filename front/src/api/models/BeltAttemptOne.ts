/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { BeltAttempt } from './BeltAttempt';
import type { ClassLevel } from './ClassLevel';
import type { SchoolClass } from './SchoolClass';
import type { SkillDomain } from './SkillDomain';
import type { Student } from './Student';

export type BeltAttemptOne = {
    belt: Belt;
    belt_attempt: BeltAttempt;
    class_level: ClassLevel;
    school_class: SchoolClass;
    skill_domain: SkillDomain;
    student: Student;
}
