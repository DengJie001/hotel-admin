import { request } from "@/utils/request";

/**
 * 获取当前登录的用户信息
 * @returns 获取当前登录的用户信息
 */
export async function currentLoginUser() {
    var res: any;
    res = await request.post(
        '/sys/user/currentLoginUser'
    ).catch((e) => {});
    return res?.data;
}

/**
 * 登录接口
 */
export async function login(params: any) {
    var res: any;
    res = await request.post(
        '/sys/user/login',
        {
            ...params
        }
    ).catch((e) => {});
    return res;
}