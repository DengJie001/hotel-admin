import { request } from "@/utils/request";
import { IconProvider, PlusOutlined } from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, Drawer, Form, FormInstance, Input, Popconfirm, Select, Space, Upload } from "antd";
import React from "react";

interface State {
    showDrawer: boolean;
    commodityList: Array<any>;
    commodityTotal: number;
    page: number;
    size: number;
    queryParam?: any;
    commodityTypeList: Array<any>;
    coverPicList: Array<any>;
    uploadCoverPicList: Array<any>;
    detailPicList: Array<any>;
    uploadDetailPicList: Array<any>;
}

export default class Commodity extends React.Component<{}, State> {
    ref = React.createRef<FormInstance>();

    state: State = {
        showDrawer: false,
        commodityList: [],
        commodityTotal: 0,
        page: 0,
        size: 10,
        commodityTypeList: [],
        coverPicList: [],
        uploadCoverPicList: [],
        detailPicList: [],
        uploadDetailPicList: []
    }

    columns = [
        {
            title: '酒店名称',
            dataIndex: 'hotelName',
            hideInSearch: false,
            algin: 'center',
            ellipsis: true,
        },
        {
            title: '商品类型',
            dataIndex: 'type',
            hideInSearch: false,
            align: 'center',
            request: async () => {
                var selectItems = [];
                selectItems.push({
                    label: "全部",
                    value: null
                });
                await request.get(
                    `/dict/listByParentCode?code=COMMODITY_TYPE`
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
                for (let i = 0; i < this.state.commodityTypeList.length; ++i) {
                    if (record === this.state.commodityTypeList[i].code) {
                        return this.state.commodityTypeList[i].value
                    }
                }
            }
        },
        {
            title: '商品名称',
            dataIndex: 'name',
            hideInSearch: false,
            align: 'center',
            ellipsis: true,
        },
        {
            title: '商品库存',
            dataIndex: 'inventory',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '商品价格',
            dataIndex: 'price',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '商品介绍',
            dataIndex: 'description',
            hideInSearch: true,
            align: 'center',
            ellipsis: true,
        },
        {
            title: '销量',
            dataIndex: 'sales',
            hideInSearch: true,
            align: 'center',
            ellipsis: true,
        },
        {
            title: '操作',
            valueType: 'option',
            align: 'center',
            render: (record: any) => {
                return (
                    <Space>
                        <a
                            onClick={() => {
                                this.openDrawer(record);
                            }}
                        >编辑</a>

                        <Popconfirm
                            title="是否确认删除"
                            okText="确认"
                            cancelText="取消"
                            onConfirm={() => {
                                this.removeCommodity(record.props.text.id);
                            }}
                        >
                            <a>删除</a>
                        </Popconfirm>
                    </Space>
                )
            }
        }
    ]

    getPicFile = async (ids: Array<any>) => {
        var picFiles = [];
        for (let i = 0; i < ids.length; ++i) {
            if (ids[i]) {
                picFiles.push({
                    thumbUrl: `${process.env.URL}/static/download/${ids[i]}`,
                    response: {
                        code: 0,
                        data: ids[i]
                    }
                })
            }
        }
        return picFiles;
    }

    /**
     * 打开商品信息编辑页面
     * @param record 
     */
    openDrawer = async (record: any) => {
        if (record && record.props.text.coverPicList?.length > 0) {
            this.setState({
                coverPicList: await this.getPicFile(record.props.text.coverPicList),
                uploadCoverPicList: record.props.text.coverPicList
            })
        }
        if (record && record.props.text.detailPicList?.length > 0) {
            this.setState({
                detailPicList: await this.getPicFile(record.props.text.detailPicList),
                uploadDetailPicList: record.props.text.detailPicList
            })
        }
        this.setState({
            showDrawer: true,
        }, () => {
            this.ref.current?.setFieldsValue({ ...record.props.text })
        })
    }

    /**
     * 关闭商品信息编辑页面
     */
    closeDrawer = () => {
        this.setState({
            showDrawer: false,
            coverPicList: [],
            uploadCoverPicList: [],
            detailPicList: [],
            uploadDetailPicList: []
        }, () => {
            this.ref.current?.setFieldsValue({
                id: null, hotelId: null, type: null, name: null, inventory: null, price: null, description: null
            })
        })
    }

    /**
     * 新增或修改商品数据
     * @param commodityData 
     */
    modifyCommodity = async (commodityData: any) => {
        commodityData.coverImage = null;
        commodityData.detailImages = null;
        await request.post(
            '/hotelCommodity/modify',
            {
                ...commodityData,
                coverPicList: this.state.uploadCoverPicList,
                detailPicList: this.state.uploadDetailPicList
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable(1, 10);
                this.closeDrawer();
            }
        }).catch((e) => {});
    }

    /**
     * 删除商品ID
     * @param id 商品ID
     */
    removeCommodity = async (id: string) => {
        await request.get(
            `/hotelCommodity/remove?id=${id}`
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable(1, 10);
            }
        }).catch((e) => {});
    }

    /**
     * 初始化表格数据
     * @param page 
     * @param size 
     */
    loadDataToTable = async (page?: number, size?: number) => {
        await request.post(
            '/hotelCommodity/pageList',
            {
                page: page || this.state.page,
                size: size || this.state.size,
                ...this.state.queryParam
            }
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    commodityList: res.data.data,
                    commodityTotal: res.data.count
                })
            }
        }).catch((e) => {});
    }

    componentDidMount() {
        request.get(
            `/dict/listByParentCode?code=COMMODITY_TYPE`
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    commodityTypeList: res.data
                })
            }
        }).catch((e) => {});

        this.loadDataToTable(1, 10);
    }

    render () {
        return (
            <PageContainer>
                <ProTable
                    headerTitle="商品信息"
                    columns={this.columns}
                    scroll={{ x: 1300 }}
                    dataSource={this.state.commodityList}
                    pagination={{
                        total: this.state.commodityTotal,
                        pageSize: Number(this.state.size),
                        current: Number(this.state.page),
                        showSizeChanger: false,
                    }}
                    rowKey={'id'}
                    search={{
                        optionRender: ({ searchText, resetText }, { form }) => {
                            return [
                                <Button
                                    key="searchCommodityBtn"
                                    onClick={() => {
                                        form?.submit()
                                    }}
                                    type="primary"
                                >
                                    { searchText}
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
                    toolBarRender={() => [
                        <Button
                            key="addCommodityBtn"
                            type="primary"
                            onClick={() => {
                                this.setState({
                                    showDrawer: true
                                })
                            }}
                        >
                            <PlusOutlined />新增
                        </Button>
                    ]} 
                    options={{ density: false, reload: false }}
                    onSubmit={(values: any) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
                                    queryParam: values
                                })
                            )
                        }).then(() => {
                            this.loadDataToTable(1, 10);
                        }).catch((e) => {});
                    }}
                    onChange={async (pagination) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
                                    page: Number(pagination.current),
                                    size: Number(pagination.pageSize)
                                })
                            )
                        }).then(() => {
                            this.loadDataToTable();
                        }).catch(() => {});
                    }}
                />
                <Drawer
                    title="商品信息"
                    width="520px"
                    onClose={() => {
                        this.closeDrawer();
                    }}
                    visible={this.state.showDrawer}
                >
                    <Form
                        layout="vertical"
                        ref={this.ref}
                        onFinish={async (values: any) => {
                            this.modifyCommodity(values);
                        }}
                    >
                        <Form.Item
                            name="id"
                            label="商品ID"
                            hidden={true}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="hotelId"
                            label="酒店ID"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '请输入酒店ID'
                                }
                            ]}
                        >
                            <Input placeholder="酒店ID" />
                        </Form.Item>

                        <Form.Item
                            name="type"
                            label="商品类型"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '请选择商品类型'
                                }
                            ]}
                        >
                            <Select>
                                {
                                    this.state.commodityTypeList.map((item: any) => {
                                        return (
                                            <Select.Option value={item.code} key={item.code}>
                                                {item.value}
                                            </Select.Option>
                                        )
                                    })
                                }
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="name"
                            label="商品名称"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '请输入商品名称'
                                }
                            ]}
                        >
                            <Input placeholder="商品名称" />
                        </Form.Item>

                        <Space size={66}>
                            <Form.Item
                                name="inventory"
                                label="商品库存"
                                required
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入商品库存'
                                    },
                                    {
                                        pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                        message: '请输入正整数'
                                    }
                                ]}
                            >
                                <Input placeholder="商品库存" />
                            </Form.Item>

                            <Form.Item
                                name="price"
                                label="商品单价"
                                required
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入商品单价'
                                    },
                                    {
                                        pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                        message: '请输入正整数'
                                    }
                                ]}
                            >
                                <Input placeholder="商品单价" addonBefore="￥" />
                            </Form.Item>
                        </Space>

                        <Form.Item
                            name="description"
                            label="商品介绍"
                        >
                            <Input.TextArea placeholder="商品介绍" />
                        </Form.Item>

                        <Form.Item
                            name="coverImage"
                            label="商品封面图片"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '请上传至少一张图片'
                                }
                            ]}
                        >
                            <Upload
                                listType="picture-card"
                                fileList={this.state.coverPicList}
                                action={`${process.env.URL}/static/upload`}
                                onChange={(upload) => {
                                    var picIds = [];
                                    for (let i = 0; i < upload.fileList.length; ++i) {
                                        picIds.push(upload.fileList[i]?.response?.data);
                                    }
                                    this.setState({
                                        coverPicList: upload.fileList,
                                        uploadCoverPicList: picIds
                                    })
                                }}
                                maxCount={1}
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: '8' }}>
                                        上传
                                    </div>
                                </div>
                            </Upload>
                        </Form.Item>

                        <Form.Item
                            name="detailImages"
                            label="详情图片"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '请上传至少一张图片'
                                }
                            ]}
                        >
                            <Upload
                                listType="picture-card"
                                fileList={this.state.detailPicList}
                                action={`${process.env.URL}/static/upload`}
                                onChange={(upload) => {
                                    var picIds = [];
                                    for (let i = 0; i < upload.fileList.length; ++i) {
                                        picIds.push(upload.fileList[i]?.response?.data);
                                    }
                                    this.setState({
                                        detailPicList: upload.fileList,
                                        uploadDetailPicList: picIds
                                    })
                                }}
                                multiple
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: '8' }}>
                                        上传
                                    </div>
                                </div>
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Space size={10}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    onClick={() => {

                                    }}
                                >
                                    提交
                                </Button>

                                <Button
                                    htmlType="button"
                                    onClick={() => {

                                    }}
                                >
                                    取消
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Drawer>
            </PageContainer>
        )
    }
}
