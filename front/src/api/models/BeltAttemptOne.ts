/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { BeltAttempt } from './BeltAttempt';
import type { SkillDomain } from './SkillDomain';
import type { Student } from './Student';

export type BeltAttemptOne = {
    belt: Belt;
    belt_attempt: BeltAttempt;
    skill_domain: SkillDomain;
    student: Student;
}
