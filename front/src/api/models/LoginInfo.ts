/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LoginPayload } from './LoginPayload';
import type { MissingI18nKeyEvents } from './MissingI18nKeyEvents';
import type { Student } from './Student';
import type { User } from './User';

export type LoginInfo = {
    missing_i18n_key_events_since_last_login?: MissingI18nKeyEvents;
    payload?: LoginPayload;
    student?: Student;
    token: string;
    user: User;
}
