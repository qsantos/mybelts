/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LoginPayload } from './LoginPayload';
import type { User } from './User';

export type LoginInfo = {
    payload?: LoginPayload;
    token: string;
    user: User;
}
