/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class WaitlistService {

    /**
     * @param waitlistId
     * @returns any Success
     * @throws ApiError
     */
    public static deleteWaitlistResource(
        waitlistId: number,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/waitlist/${waitlistId}`,
        });
    }

}