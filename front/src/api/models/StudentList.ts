/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Belt } from './Belt';
import type { Class } from './Class';
import type { ClassStudentBeltsStudentBelts } from './ClassStudentBeltsStudentBelts';
import type { Level } from './Level';
import type { SkillDomain } from './SkillDomain';
import type { Student } from './Student';

export type StudentList = {
    belts: Array<Belt>;
    class: Class;
    level: Level;
    skill_domains: Array<SkillDomain>;
    student_belts: Array<ClassStudentBeltsStudentBelts>;
    students: Array<Student>;
}
