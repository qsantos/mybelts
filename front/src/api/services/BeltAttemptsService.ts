/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BeltAttemptOne } from '../models/BeltAttemptOne';
import type { BeltAttemptPut } from '../models/BeltAttemptPut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class BeltAttemptsService {

    /**
     * @param beltAttemptId
     * @returns any Success
     * @throws ApiError
     */
    public static deleteBeltAttemptsResource(
        beltAttemptId: number,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/belt-attempts/${beltAttemptId}`,
        });
    }

    /**
     * @param beltAttemptId
     * @param xFields An optional fields mask
     * @returns BeltAttemptOne Success
     * @throws ApiError
     */
    public static getBeltAttemptsResource(
        beltAttemptId: number,
        xFields?: string,
    ): CancelablePromise<BeltAttemptOne> {
        return __request({
            method: 'GET',
            path: `/belt-attempts/${beltAttemptId}`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param beltAttemptId
     * @param payload
     * @param xFields An optional fields mask
     * @returns BeltAttemptOne Success
     * @throws ApiError
     */
    public static putBeltAttemptsResource(
        beltAttemptId: number,
        payload: BeltAttemptPut,
        xFields?: string,
    ): CancelablePromise<BeltAttemptOne> {
        return __request({
            method: 'PUT',
            path: `/belt-attempts/${beltAttemptId}`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

}