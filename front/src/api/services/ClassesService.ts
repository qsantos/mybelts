/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClassesPost } from '../models/ClassesPost';
import type { ClassExamPdfPost } from '../models/ClassExamPdfPost';
import type { ClassOne } from '../models/ClassOne';
import type { ClassPut } from '../models/ClassPut';
import type { StudentList } from '../models/StudentList';
import type { WaitlistMappingList } from '../models/WaitlistMappingList';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ClassesService {

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns ClassOne Success
     * @throws ApiError
     */
    public static postClassesResource(
        payload: ClassesPost,
        xFields?: string,
    ): CancelablePromise<ClassOne> {
        return __request({
            method: 'POST',
            path: `/classes`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param classId
     * @returns void
     * @throws ApiError
     */
    public static deleteClassResource(
        classId: number,
    ): CancelablePromise<void> {
        return __request({
            method: 'DELETE',
            path: `/classes/${classId}`,
        });
    }

    /**
     * @param classId
     * @param xFields An optional fields mask
     * @returns StudentList Success
     * @throws ApiError
     */
    public static getClassResource(
        classId: number,
        xFields?: string,
    ): CancelablePromise<StudentList> {
        return __request({
            method: 'GET',
            path: `/classes/${classId}`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param classId
     * @param payload
     * @param xFields An optional fields mask
     * @returns ClassOne Success
     * @throws ApiError
     */
    public static putClassResource(
        classId: number,
        payload: ClassPut,
        xFields?: string,
    ): CancelablePromise<ClassOne> {
        return __request({
            method: 'PUT',
            path: `/classes/${classId}`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param classId
     * @param payload
     * @returns any Success
     * @throws ApiError
     */
    public static postClassExamPdfResource(
        classId: number,
        payload: ClassExamPdfPost,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/classes/${classId}/exam-pdf`,
            body: payload,
        });
    }

    /**
     * @param classId
     * @param xFields An optional fields mask
     * @returns WaitlistMappingList Success
     * @throws ApiError
     */
    public static getClassWaitlistResource(
        classId: number,
        xFields?: string,
    ): CancelablePromise<WaitlistMappingList> {
        return __request({
            method: 'GET',
            path: `/classes/${classId}/waitlist`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

}