import { request } from "@/utils/request";
import http from "@/utils/request/http";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, Space, Table, Tag } from "antd";
import React from "react";

interface State {
    orders: Array<any>;
    orderTotal: number;
    page: number;
    size: number;
    queryParam?: any;
    status: Array<any>;
}

export default class CommodityOrder extends React.Component<{}, State> {
    state: State = {
        orders: [],
        orderTotal: 0,
        page: 1,
        size: 10,
        queryParam: {},
        status: []
    }

    columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            align: 'center',
            ellipsis: true,
            copyable: true,
            hideInSearch: false,
        },
        {
            title: '酒店名称',
            dataIndex: 'hotelName',
            align: 'center',
            hideInSearch: true,
        },
        {
            title: '房间号',
            dataIndex: 'roomNumber',
            align: 'center',
            hideInSearch: true,
        },
        {
            title: '总价',
            dataIndex: 'price',
            align: 'center',
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            align: 'center',
            hideInSearch: false,
            request: async() => {
                var selectItems = [];
                selectItems.push({
                    label: '全部',
                    value: null
                });
                await request.get(
                    '/dict/listByParentCode?code=COMMODITY_ORDER_STATUS'
                ).then((res) => {
                    if (res.code === 0) {
                        for (let i = 0; i < res.data.length; ++i) {
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
                for (let i = 0; i < this.state.status.length; ++i) {
                    if (record === this.state.status[i].code && record === 'COMMODITY_ORDER_STATUS_FINISHED') {
                        return (
                            <Tag color={'green'}>
                                {this.state.status[i].value}
                            </Tag>
                        )
                    } else if (record === this.state.status[i].code) {
                        return (
                            <Tag color={'orange'}>
                                {this.state.status[i].value}
                            </Tag>
                        )
                    }
                }
            }
        },
        {
            title: '下单时间',
            dataIndex: 'createdDate',
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
                            style={record.props.text.status === 'COMMODITY_ORDER_STATUS_FINISHED' ? {
                                color: 'rgba(0,0,0,.25)',
                                cursor: 'not-allowed'
                            } : {}}
                            onClick={() => {
                                if (record.props.text.status === 'COMMODITY_ORDER_STATUS_FINISHED') {
                                    return;
                                }
                                request.post(
                                    '/finance/commodityOrder/finish',
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
                            已完成
                        </a>
                        <a
                            style={
                                record.props.text.status === 'COMMODITY_ORDER_STATUS_FINISHED' || record.props.text.status === 'COMMODITY_ORDER_STATUS_REFUNDED' ?
                                {
                                    color: 'rgba(0,0,0,.25)',
                                    cursor: 'not-allowed'
                                } : {}
                            }
                            onClick={() => {
                                if (record.props.text.status === 'COMMODITY_ORDER_STATUS_FINISHED' || record.props.text.status === 'COMMODITY_ORDER_STATUS_REFUNDED') {
                                    return;
                                }
                                request.post(
                                    '/finance/commodityOrder/refund',
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
                            退款
                        </a>
                    </Space>
                )
            }
        }
    ]

    sonOrderColumns = [
        {
            title: '商品名称',
            dataIndex: 'commodityName',
            align: 'center',
            ellipsis: true,
            key: 'commodityName',
        },
        {
            title: '商品价格',
            dataIndex: 'commodityPrice',
            align: 'center',
            key: 'commodiityPrice',
        },
        {
            title: '商品数量',
            dataIndex: 'count',
            key: 'count',
            align: 'center'
        },
    ]

    loadDataToTable = async (page?: number, size?: number) => {
        request.post(
            '/finance/commodityOrder/pageList',
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
        }).catch((e) => {});
    }

    componentDidMount () {
        request.get(
            '/dict/listByParentCode?code=COMMODITY_ORDER_STATUS'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    status: res.data
                })
            }
        }).catch((e) => {});
        this.loadDataToTable();
    }

    render () {
        return (
            <PageContainer>
                <ProTable
                    headerTitle="商品订单"
                    columns={this.columns}
                    expandable={{
                        expandedRowRender: (record: any) => {
                            console.log(record);
                            return (
                                <Table
                                    columns={this.sonOrderColumns}
                                    dataSource={record?.sonOrderList}
                                    pagination={false}
                                    rowKey={'id'}
                                >
                                </Table>
                            )
                        }
                    }}
                    dataSource={this.state.orders}
                    rowKey={'id'}
                    pagination={{
                        pageSize: this.state.size,
                        current: this.state.page,
                        showSizeChanger: false,
                        total: this.state.orderTotal
                    }}
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
                    options={{ density: false, reload: false}}
                    onSubmit={(values: any) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
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
                                    size: Number(pagination.pageSize)
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