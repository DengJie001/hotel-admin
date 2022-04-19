import { request } from "@/utils/request";
import { PlusOutlined } from "@ant-design/icons";
import { ModalForm, ProFormInstance } from "@ant-design/pro-form";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, Form, Input, Popconfirm, Select, Space } from "antd";
import React from "react";

interface State {
    users: Array<any>;
    userTotal: number;
    page: number;
    size: number;
    queryParam: any;
    showVisible: boolean;
    allRoles: Array<any>;
    name?: string;
    loginName?: string;
    theIdOfUpdate?: string;
    modalTitle?: string;
}

export default class UserManagement extends React.Component<{}, State> {
    formRef = React.createRef<ProFormInstance>();

    columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            hideInSearch: false
        },
        {
            title: '登录名',
            dataIndex: 'loginName',
            hideInSearch: false,
        },
        {
            title: '电话号码',
            dataIndex: 'phoneNum',
            hideInSearch: true,
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            hideInSearch: true,
        },
        {
            title: '角色',
            dataIndex: 'roleName',
            hideInSearch: true
        },
        {
            title: '操作',
            valueType: 'option',
            render: (record: any) => (
                <Space>
                    <a onClick={() => {
                        this.openModalForm(record);
                    }}>
                        编辑
                    </a>
                    <Popconfirm
                        title="是否确认删除"
                        okText="确认"
                        cancelText="取消"
                        onConfirm={async () => {
                            this.removeUserInfo(record);
                        }}
                    >
                        <a>
                            删除
                        </a>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    state: State = {
        users: [],
        userTotal: 0,
        page: 1,
        size: 10,
        queryParam: {},
        showVisible: false,
        allRoles: []
    }

    /**
     * 打开ModalForm弹窗
     */
    openModalForm = (record: any) => {
        this.setState({
            modalTitle: '编辑',
            showVisible: true,
            theIdOfUpdate: record.props.text.id
        }, () => {
            this.formRef.current?.setFieldsValue({ ...record.props.text })
        })
    }

    /**
     * 关闭ModalForm弹窗
     */
    clearModalForm = () => {
        this.setState({
            showVisible: false,
            theIdOfUpdate: undefined
        }, () => {
            this.formRef.current?.setFieldsValue({
                name: undefined, loginName: undefined, password: undefined, roleId: undefined, phoneNum: undefined, email: undefined
            })
        })
    }

    /**
     * 新增或修改管理员信息
     * @param params 
     */
    modifyUserInfo = async (params: any) => {
        if (!params?.password) {
            params.password = null;
        }
        await request.post(
            '/sys/user/modify',
            {
                id: this.state.theIdOfUpdate,
                ...params
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
                this.clearModalForm();
            }
        })
    }

    /**
     * 删除用户信息
     */
    removeUserInfo = async (record: any) => {
        await request.post(
            '/sys/user/remove',
            {
                id: record.props.text.id
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
            }
        }).catch((e) => {});
    }

    /**
     * 初始化表格数据
     * @param page 当前页号
     * @param size 页面大小
     */
    loadDataToTable = async (page?: number, size?: number) => {
        // 初始化表格数据
        await request.post(
            '/sys/user/pageList',
            {
                page: page || this.state.page,
                size: size || this.state.size,
            }
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    users: res.data.data,
                    userTotal: res.data.count
                })
            }
        }).catch((e) => {});

        await request.post(
            '/sys/role/listAllRoles'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    allRoles: res.data
                })
            }
        }).catch((e) => {});
    }

    /**
     * 设置查询参数
     * @param queryParam 
     */
    setQueryParam = async (queryParam: any) => {
        this.setState({
            queryParam: queryParam
        });
    }

    /**
     * 分页查询用户信息
     */
    pageListQuery = async (page?: number, size?: number) => {
        await request.post(
            '/sys/user/pageList',
            {
                page: page || this.state.page,
                size: size || this.state.size,
                ...this.state.queryParam
            }
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    users: res.data.data,
                    userTotal: res.data.count
                });
            }
        }).catch((e) => {});
    }

    componentDidMount() {
        this.loadDataToTable();
    }

    render() {
        return (
            <PageContainer>
                <ProTable
                    headerTitle="管理员信息"
                    columns={this.columns}
                    dataSource={this.state.users}
                    pagination={{
                        total: this.state.userTotal,
                        pageSize: this.state.size,
                        current: this.state.page,
                        showSizeChanger: false
                    }}
                    rowKey={'id'}
                    toolBarRender={() => [
                        <Button
                            key="addUserBtn"
                            onClick={() => {
                                this.setState({
                                    showVisible: true,
                                    modalTitle: '新增'
                                })
                            }}
                            type="primary"
                        >
                            <PlusOutlined />新增
                        </Button>
                    ]}
                    options={{density: false, reload: false}}
                    search={{
                        labelWidth: 'auto',
                        optionRender: ({ searchText, resetText}, { form }) => {
                            return [
                                <Button
                                    key="searchBtn"
                                    type="primary"
                                    onClick={() => {
                                        form?.submit()
                                    }}
                                >
                                    { searchText }
                                </Button>,
                                <Button
                                    key="resetText"
                                    onClick={() => {
                                        form?.resetFields();
                                        new Promise((resolve) => {
                                            resolve(
                                                this.setState({
                                                    page: 1,
                                                    queryParam: {}
                                                })
                                            )
                                        }).then((res) => {
                                            this.loadDataToTable();
                                        });
                                    }}
                                >
                                    { resetText }
                                </Button>
                            ]
                        }
                    }}
                    onSubmit={async (values) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
                                    page: 1,
                                    size: 10
                                }, () => {
                                    this.setQueryParam(values);
                                })
                            )
                        }).then(() => {
                            this.pageListQuery();
                        })
                    }}
                    onChange={(pagination) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
                                    page: pagination.current
                                })
                            )
                        }).then(() => {
                            this.pageListQuery(pagination.current, pagination.pageSize)
                        })
                    }}
                />
                <ModalForm
                    formRef={this.formRef}
                    title={this.state.modalTitle}
                    width="520px"
                    visible={this.state.showVisible}
                    onVisibleChange={(showOrNot) => {
                        if (!showOrNot) {
                            this.clearModalForm();
                        }
                    }}
                    onFinish={async (values) => {
                        await this.modifyUserInfo(values);
                    }}
                >
                    <Form.Item
                        name="name"
                        label="姓名"
                        required
                        rules={[
                            {
                                required: true,
                                message: '姓名不能为空'
                            }
                        ]}
                    >
                        <Input placeholder="管理员姓名" />
                    </Form.Item>

                    <Form.Item
                        name="loginName"
                        label="登录名"
                        required
                        rules={[
                            {
                                required: true,
                                message: '登录名不能为空'
                            }
                        ]}
                    >
                        <Input disabled={this.state.modalTitle === '编辑'} placeholder="登录名" allowClear autoComplete="off" />
                    </Form.Item>

                    <Form.Item
                        name="roleId"
                        label="角色"
                        required
                        rules={[
                            {
                                required: true,
                                message: '角色为必选项'
                            }
                        ]}
                    >
                        <Select>
                            {
                                this.state.allRoles.map((item: any) => {
                                    return (
                                        <Select.Option value={item.id} key={item.id}>
                                            {item.name}
                                        </Select.Option>
                                    )
                                })
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="phoneNum"
                        label="手机号码"
                        required
                        rules={[
                            {
                                required: true,
                                pattern: new RegExp(/0?(13|14|15|17|18|19)[0-9]{9}/),
                                message: '手机号格式不正确'
                            }
                        ]}
                    >
                        <Input placeholder="手机号码" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="邮箱"
                        required
                        rules={[
                            {
                                required: true,
                                pattern: new RegExp(/\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/),
                                message: '邮箱格式不正确，例如：pengyixing@EasonHotel.com'
                            }
                        ]}
                    >
                        <Input placeholder="邮箱" />
                    </Form.Item>
                    {
                        this.state.theIdOfUpdate ?
                        (
                            <Form.Item
                                name="password"
                                label="密码"
                                rules={[
                                    {
                                        pattern: new RegExp('^[a-zA-Z0-9]{6,18}$'),
                                        message: '密码无效'
                                    }
                                ]}
                                tooltip='长度6-16，最少包含一个英文字符'
                            >
                                <Input.Password placeholder="密码" />
                            </Form.Item>
                        ) : 
                        (
                            <Form.Item
                                name="password"
                                label="密码"
                                rules={[
                                    {
                                        required: true,
                                        pattern: new RegExp('^[a-zA-Z0-9]{6,18}$'),
                                        message: '密码无效'
                                    }
                                ]}
                                tooltip="长度6-16，至少包含一个英文字符"
                            >
                                <Input.Password placeholder="密码" />
                            </Form.Item>
                        )
                    }
                </ModalForm>
            </PageContainer>
        )
    }
}