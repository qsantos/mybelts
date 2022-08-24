/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamOne } from '../models/ExamOne';
import type { ExamPut } from '../models/ExamPut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ExamsService {

    /**
     * @param examId
     * @returns void
     * @throws ApiError
     */
    public static deleteExamsResource(
        examId: number,
    ): CancelablePromise<void> {
        return __request({
            method: 'DELETE',
            path: `/exams/${examId}`,
        });
    }

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

    /**
     * @param examId
     * @param payload
     * @param xFields An optional fields mask
     * @returns ExamOne Success
     * @throws ApiError
     */
    public static putExamsResource(
        examId: number,
        payload: ExamPut,
        xFields?: string,
    ): CancelablePromise<ExamOne> {
        return __request({
            method: 'PUT',
            path: `/exams/${examId}`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

}