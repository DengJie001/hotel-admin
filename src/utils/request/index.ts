import { message } from "antd";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import http, { NetError, ResponseData} from "./http";
import { history } from "umi";
import _ from 'lodash';

const noLoginMessage = _.throttle(
    (msg: string) => {
        message.error(msg);
    },
    5000,
    {
        trailing: false,
        leading: true
    }
);

export const request = {
    parseResponse<T> (
        res: AxiosResponse<ResponseData<T>>
    ): ResponseData<T> | Promise<ResponseData<T>> {
        const data: ResponseData<T> = res.data;
        if (data.code === 0) {
            if (data.msg) {
                message.success(data.msg);
            }
            return data;
        }
        if (data.code === 401 || data.code === 403) {
            history.replace('/user/login');
            if (data.msg) {
                noLoginMessage(data.msg);
            }
        } else {
            if (data.msg) {
                message.error(data.msg);
            }
        }
        let error = new NetError<T>(data.msg);
        error.data = data;
        return Promise.reject(error);
    },

    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ResponseData<T>> {
        const res = await http.get(url, config).catch((e) => message.error(e.message));
        return this.parseResponse(res);
    },

    async post<T = any> (
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<ResponseData<T>> {
        const res = await http.post(url, data, config).catch((e) => message.error(e.message));
        return this.parseResponse(res);
    }
}