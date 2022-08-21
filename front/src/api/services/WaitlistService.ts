/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompletedEvaluationList } from '../models/CompletedEvaluationList';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class WaitlistService {

    /**
     * @param payload
     * @returns void
     * @throws ApiError
     */
    public static postWaitlistConvertResource(
        payload: CompletedEvaluationList,
    ): CancelablePromise<void> {
        return __request({
            method: 'POST',
            path: `/waitlist/convert`,
            body: payload,
        });
    }

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