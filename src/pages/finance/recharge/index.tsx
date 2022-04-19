import { request } from "@/utils/request";
import { ModalForm, ProFormInstance } from "@ant-design/pro-form";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, Form, Input, InputNumber, Space } from "antd";
import React from "react";

interface State {
    rechargeList: Array<any>;
    rechargeTotal: number;
    page: number;
    size: number;
    showModalForm: boolean;
    rechargeStatusList: Array<any>;
    queryParam?: any;
}

export default class Recharge extends React.Component<{}, State> {
    formRef = React.createRef<ProFormInstance>();

    state: State = {
        rechargeList: [],
        rechargeTotal: 0,
        page: 1,
        size: 10,
        showModalForm: false,
        rechargeStatusList: [],
        queryParam: {}
    }

    columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            align: 'center',
            ellipsis: true,
            hideInSearch: false,
        },
        {
            title: '用户ID',
            dataIndex: 'userId',
            align: 'center',
            ellipsis: true,
            hideInSearch: false,
        },
        {
            title: '金额',
            dataIndex: 'amount',
            align: 'center',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            align: 'center',
            hideInSearch: false,
            request: async () => {
                var selectItems = [];
                selectItems.push({
                    label: '全部',
                    value: null
                })
                await request.get(
                    '/dict/listByParentCode?code=RECHARGE_STATUS'
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
                for (let i = 0; i < this.state.rechargeStatusList.length; ++i) {
                    if (record === this.state.rechargeStatusList[i].code) {
                        return this.state.rechargeStatusList[i].value
                    }
                }
            }
        },
        {
            title: '创建时间',
            dataIndex: 'rechargeTime',
            align: 'center',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            align: 'center',
            render: (record: any) => {
                return (
                    <Space>
                        <a
                            style={
                                record.props.text.status === 'RECHARGE_STATUS_FINISHED' ? 
                                {
                                    color: 'rgba(0,0,0,.25)',
                                    cursor: 'not-allowed'
                                } : {}
                            }
                            onClick={() => {
                                if (record.props.text.status === 'RECHARGE_STATUS_FINISHED') {
                                    return;
                                }
                                request.post(
                                    '/finance/recharge/confirm',
                                    {
                                        id: record.props.text.id
                                    }
                                ).then((res) => {
                                    if (res.code === 0) {
                                        this.loadDataToTable();
                                    }
                                }).catch((e) => {});
                            }}
                        >
                            确认
                        </a>
                    </Space>
                )
            }
        }
    ]

    closeModalForm = () => {
        this.setState({
            showModalForm: false,
        }, () => {
            this.formRef.current?.setFieldsValue({
                userId: null, amount: null
            })
        });
    }

    loadDataToTable = async (page?: number, size?: number) => {
        await request.post(
            '/finance/recharge/pageList',
            {
                page: page || this.state.page,
                size: size || this.state.size,
                ...this.state.queryParam
            }
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    rechargeTotal: res.data.count,
                    rechargeList: res.data.data
                })
            }
        }).catch((e) => {});
    }

    componentDidMount() {
        request.get(
            '/dict/listByParentCode?code=RECHARGE_STATUS'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    rechargeStatusList: res.data
                })
            }
        }).catch((e) => {});

        this.loadDataToTable();
    }

    render() {
        return (
            <PageContainer>
                <ProTable
                    headerTitle="充值记录"
                    columns={this.columns}
                    dataSource={this.state.rechargeList}
                    rowKey={'id'}
                    pagination={{
                        pageSize: this.state.size,
                        current: this.state.page,
                        showSizeChanger: false,
                        total: this.state.rechargeTotal
                    }}
                    toolBarRender={() => [
                        <Button
                            key='rechargeBtn'
                            onClick={() => {
                                this.setState({
                                    showModalForm: true
                                })
                            }}
                            type="primary"
                        >
                            充值
                        </Button>
                    ]}
                    options={{density: false, reload: false}}
                    search={{
                        optionRender: ({ searchText, resetText}, { form }) => {
                            return [
                                <Button
                                    key="queryRechargeBtn"
                                    type="primary"
                                    onClick={() => {
                                        form?.submit()
                                    }}
                                >
                                    { searchText }
                                </Button>,
                                <Button
                                    key="resetBtn"
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
                        }).then((res) => {
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
                <ModalForm
                    formRef={this.formRef}
                    title="用户充值"
                    width="520px"
                    visible={this.state.showModalForm}
                    onVisibleChange={(showOrNot) => {
                        if (!showOrNot) {
                            this.closeModalForm();
                        }
                    }}
                    onFinish={async(values: any) => {
                        await request.post(
                            '/finance/recharge/recharge',
                            {
                                ...values
                            }
                        ).then((res) => {
                            if (res.code === 0) {
                                this.loadDataToTable();
                            }
                        })
                    }}
                >
                    <Form.Item
                        name="userId"
                        label="用户ID"
                        required
                        rules={[
                            {
                                required: true,
                                message: '请输入用户ID'
                            }
                        ]}
                    >
                        <Input placeholder="用户ID" />
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="金额"
                        required
                        rules={[
                            {
                                required: true,
                                message: '请输入充值金额'
                            },
                            {
                                pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                message: '请输入正整数'
                            }
                        ]}
                    >
                        <Input placeholder="金额" addonBefore="￥" />
                    </Form.Item>
                </ModalForm>
            </PageContainer>
        )
    }
}