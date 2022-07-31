/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LoginPayload } from './LoginPayload';
import type { Student } from './Student';
import type { User } from './User';

export type LoginInfo = {
    payload?: LoginPayload;
    student?: Student;
    token: string;
    user: User;
}
