/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BeltAttemptList } from '../models/BeltAttemptList';
import type { StudentListBare } from '../models/StudentListBare';
import type { StudentOne } from '../models/StudentOne';
import type { StudentPut } from '../models/StudentPut';
import type { StudentsPost } from '../models/StudentsPost';
import type { StudentsPut } from '../models/StudentsPut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class StudentsService {

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns StudentOne Success
     * @throws ApiError
     */
    public static postStudentsResource(
        payload: StudentsPost,
        xFields?: string,
    ): CancelablePromise<StudentOne> {
        return __request({
            method: 'POST',
            path: `/students`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns StudentListBare Success
     * @throws ApiError
     */
    public static putStudentsResource(
        payload: StudentsPut,
        xFields?: string,
    ): CancelablePromise<StudentListBare> {
        return __request({
            method: 'PUT',
            path: `/students`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param studentId
     * @returns any Success
     * @throws ApiError
     */
    public static deleteStudentResource(
        studentId: number,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/students/${studentId}`,
        });
    }

    /**
     * @param studentId
     * @param xFields An optional fields mask
     * @returns StudentOne Success
     * @throws ApiError
     */
    public static getStudentResource(
        studentId: number,
        xFields?: string,
    ): CancelablePromise<StudentOne> {
        return __request({
            method: 'GET',
            path: `/students/${studentId}`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param studentId
     * @param payload
     * @param xFields An optional fields mask
     * @returns StudentOne Success
     * @throws ApiError
     */
    public static putStudentResource(
        studentId: number,
        payload: StudentPut,
        xFields?: string,
    ): CancelablePromise<StudentOne> {
        return __request({
            method: 'PUT',
            path: `/students/${studentId}`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param studentId
     * @param xFields An optional fields mask
     * @returns BeltAttemptList Success
     * @throws ApiError
     */
    public static getStudentBeltAttemptsResource(
        studentId: number,
        xFields?: string,
    ): CancelablePromise<BeltAttemptList> {
        return __request({
            method: 'GET',
            path: `/students/${studentId}/belt-attempts`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

}