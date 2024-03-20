/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { Class } from './Class';
import type { Exam } from './Exam';
import type { Level } from './Level';
import type { SkillDomain } from './SkillDomain';

export type ClassList = {
    belts: Array<Belt>;
    classes: Array<Class>;
    exams: Array<Exam>;
    level: Level;
    skill_domains: Array<SkillDomain>;
}
