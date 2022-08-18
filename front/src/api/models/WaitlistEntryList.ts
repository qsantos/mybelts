/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { ClassLevel } from './ClassLevel';
import type { SchoolClass } from './SchoolClass';
import type { SkillDomain } from './SkillDomain';
import type { Student } from './Student';
import type { WaitlistEntry } from './WaitlistEntry';

export type WaitlistEntryList = {
    belts: Array<Belt>;
    class_level: ClassLevel;
    school_class: SchoolClass;
    skill_domains: Array<SkillDomain>;
    students: Array<Student>;
    waitlist_entries: Array<WaitlistEntry>;
}
