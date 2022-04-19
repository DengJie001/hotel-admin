import axios, { AxiosResponse } from 'axios';
import { history } from 'umi';

export interface ResponseData<T> {
    code: number,
    data: T,
    msg?: string
}

export class NetError<T> extends Error {
    data?: ResponseData<T>;
}

const http = axios.create({
    baseURL: process.env.URL,
    timeout: 60 * 1000,
    withCredentials: true
});

http.interceptors.response.use(
    function (value: AxiosResponse): AxiosResponse{
        return value;
    },

    function (err: any): any {
        if (err.response?.data?.msg) {
            err.message = err.response.data.msg;
        } else {
            err.message = 'Service Error';
        }

        if (err.response?.data?.code === 401 || err.response?.data?.code === 403) {
            history.replace('/user/login');
        }
        return Promise.reject(err);
    }
)

export default http;