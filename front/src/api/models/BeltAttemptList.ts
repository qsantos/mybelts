/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { BeltAttempt } from './BeltAttempt';
import type { SkillDomain } from './SkillDomain';
import type { Student } from './Student';

export type BeltAttemptList = {
    belt_attempts: Array<BeltAttempt>;
    belts: Array<Belt>;
    skill_domains: Array<SkillDomain>;
    student: Student;
}
