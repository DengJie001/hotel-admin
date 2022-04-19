import { request } from "@/utils/request";
import { ModalForm } from "@ant-design/pro-form";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, Form, FormInstance, Input, Popconfirm, Space } from "antd";
import React from "react";

interface State {
    page: number;
    size: number;
    orders: Array<any>;
    orderTotal: number;
    queryParam: any;
    showModalForm: boolean;
    theOrderIdOfRefund?: string;
    orderStatus: Array<any>;
}

export default class Order extends React.Component<{}, State> {
    formRef = React.createRef<FormInstance>();

    state: State = {
        orderStatus: [],
        page: 0,
        size: 10,
        orders: [],
        orderTotal: 0,
        queryParam: {},
        showModalForm: false,
    }

    columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            align: 'center',
            ellipsis: true,
            copyable: true,
        },
        {
            title: '酒店名称',
            dataIndex: 'hotelName',
            align: 'center',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '客房名称',
            dataIndex: 'roomName',
            align: 'center',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '客房号',
            dataIndex: 'roomNumber',
            align: 'center',
            hideInSearch: true,
        },
        {
            title: '入住时间',
            dataIndex: 'startDate',
            align: 'center',
            hideInSearch: true,
        },
        {
            title: '订单状态',
            dataIndex: 'status',
            align: 'center',
            hideInSearch: false,
            request: async () => {
                var selectItems = [];
                selectItems.push({
                    label: '全部',
                    value: null
                });
                await request.get(
                    '/dict/listByParentCode?code=HOTEL_ORDER_STATUS'
                ).then((res) => {
                    if (res.code === 0) {
                        for (let i = 0; i < res.data?.length; ++i) {
                            selectItems.push({
                                label: res.data[i].value,
                                value: res.data[i].code
                            })
                        }
                    }
                }).catch((e) => { });
                return selectItems;
            },
            render: (record: any) => {
                return record;
            }
        },
        {
            title: '居住时间',
            dataIndex: 'days',
            align: 'center',
            hideInSearch: true,
        },
        {
            title: '订单金额',
            dataIndex: 'orderAmount',
            align: 'center',
            hideInSearch: true,
        },
        {
            title: '用户姓名',
            dataIndex: 'userName',
            align: 'center',
            hideInSearch: true,
        },
        {
            title: '联系方式',
            dataIndex: 'telNumber',
            align: 'center',
            hideInSearch: false,
        },
        {
            title: '入住人数',
            dataIndex: 'peopleNumber',
            align: 'center',
            hideInSearch: true,
        },
        {
            title: '订单备注',
            dataIndex: 'remark',
            align: 'center',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '下单时间',
            dataIndex: 'createdAt',
            align: 'center',
            hideInSearch: true,
            width: 200,
        },
        {
            title: '操作',
            valueType: 'option',
            render: (record: any) => {
                return (
                    <Space>
                        {
                            record.props.text.status === '已退款' || record.props.text.status === '已结束' ?
                                <a style={{
                                    cursor: 'not-allowed',
                                    color: 'rgba(0,0,0,.25)'
                                }}>退房</a> :
                                <Popconfirm
                                    title="是否确认退房？"
                                    okText="确认"
                                    cancelText="取消"
                                    onConfirm={() => {
                                        request.get(
                                            `/finance/hotelOrder/checkOut?id=${record.props.text.id}`
                                        ).then((res) => {
                                            if (res.code === 0) {
                                                this.loadDataToTable();
                                            }
                                        }).catch((e) => { });
                                    }}
                                >
                                    <a>退房</a>
                                </Popconfirm>
                        }
                        {
                            record.props.text.status === '已退款' ?
                                <a style={{
                                    cursor: 'not-allowed',
                                    color: 'rgba(0,0,0,.25)'
                                }}>
                                    退款
                                </a> :
                                <Popconfirm
                                    title="是否确认退款？"
                                    okText="确认"
                                    cancelText="取消"
                                    onConfirm={() => {
                                        this.setState({
                                            showModalForm: true,
                                            theOrderIdOfRefund: record.props.text.id
                                        })
                                    }}
                                >
                                    <a>
                                        退款
                                    </a>
                                </Popconfirm>
                        }
                    </Space>
                )
            }
        }
    ]

    loadDataToTable = async (page?: number, size?: number) => {
        request.post(
            '/finance/hotelOrder/pageList',
            {
                page: page || this.state.page,
                size: size || this.state.size,
                ...this.state.queryParam
            }
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    orders: res.data.data,
                    orderTotal: res.data.count
                })
            }
        }).catch((e) => { });
    }

    componentDidMount() {
        request.get(
            '/dict/listByParentCode?code=HOTEL_ORDER_STATUS'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    orderStatus: res.data
                })
            }
        }).catch((e) => { });
        this.loadDataToTable();
    }

    render() {
        return (
            <PageContainer>
                <ProTable
                    headerTitle="订单信息"
                    columns={this.columns}
                    dataSource={this.state.orders}
                    scroll={{ x: 1300 }}
                    pagination={{
                        total: this.state.orderTotal,
                        pageSize: this.state.size,
                        current: this.state.page,
                        showSizeChanger: false
                    }}
                    rowKey={'id'}
                    search={{
                        optionRender: ({ searchText, resetText }, { form }) => {
                            return [
                                <Button
                                    key="searchOrderBtn"
                                    onClick={() => {
                                        form?.submit()
                                    }}
                                    type="primary"
                                >
                                    {searchText}
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
                                        }).then((res) => {
                                            this.loadDataToTable();
                                        })
                                    }}
                                >
                                    {resetText}
                                </Button>
                            ]
                        }
                    }}
                    toolBarRender={false}
                    options={{ density: false, reload: false }}
                    onSubmit={(value: any) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
                                    queryParam: value,
                                    page: 1,
                                    size: 10
                                })
                            )
                        }).then(() => {
                            this.loadDataToTable();
                        });
                    }}
                    onChange={(pagination) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
                                    page: Number(pagination.current),
                                    size: Number(pagination.pageSize)
                                })
                            )
                        }).then(() => {
                            this.loadDataToTable();
                        })
                    }}
                />
                <ModalForm
                    formRef={this.formRef}
                    title="输入密码二次确认"
                    width="520px"
                    visible={this.state.showModalForm}
                    onVisibleChange={(showOrNot) => {
                        if (!showOrNot) {
                            this.setState({
                                showModalForm: false
                            })
                        }
                    }}
                    onFinish={async (values: any) => {
                        request.post(
                            '/finance/hotelOrder/refund',
                            {
                                id: this.state.theOrderIdOfRefund,
                                password: values.password
                            }
                        ).then((res) => {
                            if (res.code === 0) {
                                this.loadDataToTable();
                                this.setState({
                                    showModalForm: false
                                })
                            }
                        }).catch((e) => { })
                    }}
                >
                    <Form.Item
                        name="password"
                        label="密码"
                        required
                        rules={[
                            {
                                required: true,
                                message: '请输入密码进行二次确认'
                            }
                        ]}
                    >
                        <Input.Password placeholder="密码" />
                    </Form.Item>
                </ModalForm>
            </PageContainer>
        )
    }
}