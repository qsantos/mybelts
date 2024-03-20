/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { Class } from './Class';
import type { Evaluation } from './Evaluation';
import type { Level } from './Level';
import type { SkillDomain } from './SkillDomain';
import type { Student } from './Student';

export type EvaluationList = {
    belts: Array<Belt>;
    class: Class;
    evaluations: Array<Evaluation>;
    level: Level;
    skill_domains: Array<SkillDomain>;
    student: Student;
}
