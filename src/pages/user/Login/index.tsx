import {
    LockOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Alert, message, Tabs } from 'antd';
import React, { useState } from 'react';
import { ProFormText, LoginForm } from '@ant-design/pro-form';
import { history, SelectLang, useModel } from 'umi';
import Footer from '@/components/Footer';
import { login, currentLoginUser } from '@/services/User/api';

import styles from './index.less';

const LoginMessage: React.FC<{
    content: string;
}> = ({ content }) => (
    <Alert
        style={{
            marginBottom: 24,
        }}
        message={content}
        type="error"
        showIcon
    />
);

const Login: React.FC = () => {
    const [userLoginState, setUserLoginState] = useState<UserInfo.LoginResult>({});
    const [type, setType] = useState<string>('account');
    const { initialState, setInitialState } = useModel('@@initialState');

    /**
     * 登录
     * @param values 
     * @returns 
     */
    const handleSubmit = async (values: any) => {
        try {
            const msg = await login({ loginName: values.username, password: values.password });
            if (msg?.code === 0) {
                const defaultLoginSuccessMessage = "登录成功";
                message.success(defaultLoginSuccessMessage);
                const userInfo = await currentLoginUser();
                if (userInfo) {
                    console.log('-----------------------------')
                    console.log(userInfo);
                    await setInitialState((s) => ({
                        ...s,
                        currentUser: userInfo
                    }));
                }
                if (!history) {
                    return;
                }
                const { query } = history.location;
                const { redirect } = query as { redirect: string };
                history.push(redirect || '/')
                return;
            }
            setUserLoginState({ status: 'error' });
        } catch (error) {
            const defaultLoginFailureMessage = "登录失败";
            message.error(defaultLoginFailureMessage);
        }
    };
    
    const { status } = userLoginState;

    return (
        <div className={styles.container}>
            <div className={styles.lang} data-lang>
                {SelectLang && <SelectLang />}
            </div>
            <div className={styles.content}>
                <LoginForm
                    logo={<img alt="logo" src="/logo.svg" />}
                    title="Eason Hotel"
                    subTitle="Eason Hotel后台管理系统"
                    onFinish={async (values) => {
                        await handleSubmit(values as API.LoginParams);
                    }}
                >
                    <Tabs activeKey={type} onChange={setType}>
                        <Tabs.TabPane
                            key="account"
                            tab="账户密码登录"
                        />
                    </Tabs>

                    {type === 'account' && (
                        <>
                            <ProFormText
                                name="username"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined className={styles.prefixIcon} />,
                                }}
                                placeholder="用户名"
                                rules={[
                                    {
                                        required: true,
                                        message: "请输入用户名",
                                    },
                                ]}
                            />
                            <ProFormText.Password
                                name="password"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <LockOutlined className={styles.prefixIcon} />,
                                }}
                                placeholder="密码"
                                rules={[
                                    {
                                        required: true,
                                        message: "请输入密码",
                                    },
                                ]}
                            />
                        </>
                    )}
                </LoginForm>
            </div>
            <Footer />
        </div>
    );
};
export default Login;
