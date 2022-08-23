/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ExamsService {

    /**
     * @param examId
     * @returns any Success
     * @throws ApiError
     */
    public static getExamsResource(
        examId: number,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/exams/${examId}`,
        });
    }

}