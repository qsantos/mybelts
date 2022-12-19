/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { WaitlistEntry } from './WaitlistEntry';

export type WaitlistMapping = {
    student_id: number;
    waitlist_entries: Array<WaitlistEntry>;
}
