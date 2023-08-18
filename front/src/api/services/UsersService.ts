/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserList } from '../models/UserList';
import type { UserOne } from '../models/UserOne';
import type { UserPut } from '../models/UserPut';
import type { UsersPost } from '../models/UsersPost';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class UsersService {

    /**
     * @param xFields An optional fields mask
     * @returns UserList Success
     * @throws ApiError
     */
    public static getUsersResource(
        xFields?: string,
    ): CancelablePromise<UserList> {
        return __request({
            method: 'GET',
            path: `/users`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param payload
     * @param xFields An optional fields mask
     * @returns UserOne Success
     * @throws ApiError
     */
    public static postUsersResource(
        payload: UsersPost,
        xFields?: string,
    ): CancelablePromise<UserOne> {
        return __request({
            method: 'POST',
            path: `/users`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

    /**
     * @param userId
     * @returns void
     * @throws ApiError
     */
    public static deleteUserResource(
        userId: number,
    ): CancelablePromise<void> {
        return __request({
            method: 'DELETE',
            path: `/users/${userId}`,
        });
    }

    /**
     * @param userId
     * @param xFields An optional fields mask
     * @returns UserOne Success
     * @throws ApiError
     */
    public static getUserResource(
        userId: number,
        xFields?: string,
    ): CancelablePromise<UserOne> {
        return __request({
            method: 'GET',
            path: `/users/${userId}`,
            headers: {
                'X-Fields': xFields,
            },
        });
    }

    /**
     * @param userId
     * @param payload
     * @param xFields An optional fields mask
     * @returns UserOne Success
     * @throws ApiError
     */
    public static putUserResource(
        userId: number,
        payload: UserPut,
        xFields?: string,
    ): CancelablePromise<UserOne> {
        return __request({
            method: 'PUT',
            path: `/users/${userId}`,
            headers: {
                'X-Fields': xFields,
            },
            body: payload,
        });
    }

}