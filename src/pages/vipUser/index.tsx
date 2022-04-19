import { request } from "@/utils/request";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, Space } from "antd";
import React from "react";

interface State {
    page: number;
    size: number;
    userTotal: number;
    userList: Array<any>
    userLevelList: Array<any>;
    queryParam: any;
}

export default class VipUser extends React.Component<{}, State> {

    state: State = {
        page: 1,
        size: 10,
        userTotal: 0,
        userList: [],
        userLevelList: [],
        queryParam: {}
    }

    columns = [
        {
            title: '用户ID',
            dataIndex: 'id',
            align: 'center',
            ellipsis: true,
            hideInSearch: true,
            copyable: true,
        },
        {
            title: '联系方式',
            dataIndex: 'phoneNumber',
            align: 'center',
            ellipsis: true,
            hideInSearch: false,
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            align: 'center',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '微信昵称',
            dataIndex: 'nickName',
            align: 'center',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '姓名',
            dataIndex: 'realName',
            align: 'center',
            ellipsis: true,
            hideInSearch: false,
        },
        {
            title: '账户余额',
            dataIndex: 'balance',
            align: 'center',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '积分',
            dataIndex: 'point',
            align: 'center',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '等级',
            dataIndex: 'level',
            align: 'center',
            hideInSearch: false,
            request: async () => {
                var selectItems = [];
                selectItems.push({
                    label: '全部',
                    value: null
                });
                await request.get(
                    '/dict/listByParentCode?code=VIP_USER_LEVEL'
                ).then((res) => {
                    if (res.code === 0) {
                        for (let i = 0; i < res.data?.length; ++i) {
                            selectItems.push({
                                label: res.data[i].value,
                                value: res.data[i].code
                            })
                        }
                    }
                }).catch((e) => {});
                return selectItems;
            },
            render: (record: any) => {
                for (let i = 0; i < this.state.userLevelList.length; ++i) {
                    if (record === this.state.userLevelList[i].code) {
                        return this.state.userLevelList[i].value
                    }
                }
            }
        }
    ]

    loadDataToTable = async (page?: number, size?: number) => {
        await request.post(
            '/vipUser/pageList',
            {
                page: page || this.state.page,
                size: size || this.state.size,
                ...this.state.queryParam
            }
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    userList: res.data.data,
                    userTotal: res.data.count
                })
            }
        }).catch((e) => {});
    }

    componentDidMount() {
        request.get(
            '/dict/listByParentCode?code=VIP_USER_LEVEL'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    userLevelList: res.data
                })
            }
        }).catch((e) => {});

        this.loadDataToTable();
    }

    render() {
        return (
            <PageContainer>
                <ProTable
                    headerTitle="会员信息"
                    columns={this.columns}
                    dataSource={this.state.userList}
                    rowKey={'id'}
                    pagination={{
                        pageSize: this.state.size,
                        current: this.state.page,
                        showSizeChanger: false,
                        total: this.state.userTotal
                    }}
                    options={{density: false, reload: false}}
                    search={{
                        optionRender: ({ searchText, resetText }, { form }) => {
                            return [
                                <Button
                                    key="queryUserInfoBtn"
                                    type="primary"
                                    onClick={() => {
                                        form?.submit()
                                    }}
                                >
                                    { searchText }
                                </Button>,
                                <Button
                                    key="resetQueryBtn"
                                    onClick={() => {
                                        form?.resetFields();
                                        new Promise((resolve) => {
                                            resolve(
                                                this.setState({
                                                    page: 1,
                                                    size: 10,
                                                    queryParam: {}
                                                })
                                            )
                                        }).then(() => {
                                            this.loadDataToTable();
                                        })
                                    }}
                                >
                                    { resetText }
                                </Button>
                            ]
                        }
                    }}
                    onSubmit={(values: any) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
                                    page: 1,
                                    size: 10,
                                    queryParam: values
                                })
                            )
                        }).then(() => {
                            this.loadDataToTable();
                        })
                    }}
                    onChange={(pagination) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
                                    page: Number(pagination.current),
                                    size: Number(pagination.pageSize),
                                })
                            )
                        }).then(() => {
                            this.loadDataToTable();
                        })
                    }}
                />
            </PageContainer>
        )
    }
}