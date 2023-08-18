/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SchoolClassesPost } from '../models/SchoolClassesPost';
import type { SchoolClassOne } from '../models/SchoolClassOne';
import type { SchoolClassPut } from '../models/SchoolClassPut';
import type { StudentList } from '../models/StudentList';
import type { WaitlistMappingList } from '../models/WaitlistMappingList';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class SchoolClassesService {

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns SchoolClassOne Success
     * @throws ApiError
     */
    public static postSchoolClassesResource(
        payload: SchoolClassesPost,
        xFields?: string,
    ): CancelablePromise<SchoolClassOne> {
        return __request({
            method: 'POST',
            path: `/school-classes`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param schoolClassId
     * @returns void
     * @throws ApiError
     */
    public static deleteSchoolClassResource(
        schoolClassId: number,
    ): CancelablePromise<void> {
        return __request({
            method: 'DELETE',
            path: `/school-classes/${schoolClassId}`,
        });
    }

    /**
     * @param schoolClassId
     * @param xFields An optional fields mask
     * @returns StudentList Success
     * @throws ApiError
     */
    public static getSchoolClassResource(
        schoolClassId: number,
        xFields?: string,
    ): CancelablePromise<StudentList> {
        return __request({
            method: 'GET',
            path: `/school-classes/${schoolClassId}`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param schoolClassId
     * @param payload
     * @param xFields An optional fields mask
     * @returns SchoolClassOne Success
     * @throws ApiError
     */
    public static putSchoolClassResource(
        schoolClassId: number,
        payload: SchoolClassPut,
        xFields?: string,
    ): CancelablePromise<SchoolClassOne> {
        return __request({
            method: 'PUT',
            path: `/school-classes/${schoolClassId}`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param schoolClassId
     * @returns any Success
     * @throws ApiError
     */
    public static getSchoolClassExamPdfResource(
        schoolClassId: number,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/school-classes/${schoolClassId}/exam-pdf`,
        });
    }

    /**
     * @param schoolClassId
     * @param xFields An optional fields mask
     * @returns WaitlistMappingList Success
     * @throws ApiError
     */
    public static getSchoolClassWaitlistResource(
        schoolClassId: number,
        xFields?: string,
    ): CancelablePromise<WaitlistMappingList> {
        return __request({
            method: 'GET',
            path: `/school-classes/${schoolClassId}/waitlist`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

}