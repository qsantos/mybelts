/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { ClassLevel } from './ClassLevel';
import type { SchoolClass } from './SchoolClass';
import type { SkillDomain } from './SkillDomain';
import type { Student } from './Student';
import type { WaitlistEntry } from './WaitlistEntry';

export type WaitlistEntryOne = {
    belt: Belt;
    class_level: ClassLevel;
    school_class: SchoolClass;
    skill_domain: SkillDomain;
    student: Student;
    waitlist_entry: WaitlistEntry;
}
