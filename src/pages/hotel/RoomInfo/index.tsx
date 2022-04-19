import { request } from "@/utils/request";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { ModalForm, ProFormInstance } from "@ant-design/pro-form";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, Drawer, Form, Input, Popconfirm, Select, Space, Table, Tag, Upload } from "antd";
import { FormInstance } from "rc-field-form";
import React from "react";

interface State {
    theIdOfUpdate?: string;
    page: number;
    size: number;
    allRooms: Array<any>;
    roomTotal: number;
    coverPicList: Array<any>;
    uploadCoverPicList: Array<any>;
    detailPicList: Array<any>;
    uploadDetailPicList: Array<any>;
    showDrawer: boolean;
    queryParam?: any;
    drawerAction?: string;
    currentStatus?: string;
    showRoomNumberModalForm: boolean;
    allStatus: Array<any>;
}

export default class RoomInfo extends React.Component<{}, State> {
    ref = React.createRef<FormInstance>();
    formRef = React.createRef<ProFormInstance>();

    state: State = {
        page: 1,
        size: 10,
        allRooms: [],
        roomTotal: 0,
        coverPicList: [],
        uploadCoverPicList: [],
        detailPicList: [],
        uploadDetailPicList: [],
        showDrawer: false,
        showRoomNumberModalForm: false,
        allStatus: []
    }

    columns = [
        {
            title: '酒店名称',
            dataIndex: 'hotelName',
            hideInSearch: false,
            ellipsis: true,
            align: 'center',
        },
        {
            title: '客房名称',
            dataIndex: 'name',
            hideInSearch: true,
            ellipsis: true,
            align: 'center',
        },
        {
            title: '床型',
            dataIndex: 'bedType',
            hideInSearch: true,
            ellipsis: true,
            align: 'center',
        },
        {
            title: '入住人数',
            dataIndex: 'peopleNumber',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '最小面积',
            dataIndex: 'minimumArea',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '最大面积',
            dataIndex: 'maximumArea',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '价格',
            dataIndex: 'price',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '操作',
            valueType: 'option',
            align: 'center',
            render: (record: any) => (
                <Space>
                    <a
                        onClick={() => {
                            this.openRoomInfoDrawer(record);
                        }}
                    >
                        编辑
                    </a>
                    <Popconfirm
                        title="是否确认删除"
                        okText="确认"
                        cancelText="取消"
                        onConfirm={() => {
                            request.get(
                                `/hotel/hotelRoom/remove?id=${record.props.text.id}`
                            ).then((res) => {
                                if (res.code === 0) {
                                    this.loadDataToTable();
                                }
                            }).catch((e) => {});
                        }}
                    >
                        <a>删除</a>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    /**
     * 展开行
     */
    roomNumberColumns = [
        {
            title: '门牌号',
            key: 'roomNumber',
            dataIndex: 'roomNumber',
            align: 'center',
        },
        {
            title: '状态',
            key: 'status',
            dataIndex: 'status',
            align: 'center',
            render: (record: any) => {
                if (record === 'ROOM_STATUS_IN_USE') {
                    return (
                        <Tag color={'red'}>
                            使用中
                        </Tag>
                    )
                } else {
                    return (
                        <Tag color={'green'}>
                            空闲
                        </Tag>
                    )
                }
            }
        },
        {
            title: '价格',
            key: 'price',
            dataIndex: 'price',
            align: 'center'
        },
        {
            title: '面积',
            key: 'area',
            dataIndex: 'area',
            align: 'center'
        },
        {
            title: '操作',
            key: 'option',
            valueType: 'option',
            align: 'center',
            render: (record: any) => (
                <Space>
                    <a
                        onClick={() => {
                            if (record.status !== 'ROOM_STATUS_IN_USE') {
                                this.setState({
                                    currentStatus: record.status,
                                    showRoomNumberModalForm: true,
                                }, () => {
                                    this.formRef.current?.setFieldsValue({ ...record });
                                })
                            } 
                        }}
                        style={record.status === 'ROOM_STATUS_IN_USE' ? {
                            color: 'rgba(0,0,0,.25)',
                            cursor: 'not-allowed'
                        } : {}}
                    >编辑</a>
                    {
                        record.status === 'ROOM_STATUS_IN_USE' ? 
                        <a
                            style={{
                                color: 'rgba(0,0,0,.25)',
                                cursor: 'not-allowed'
                            }}
                        >
                            删除
                        </a> : 
                        <Popconfirm
                            title="是否确认删除"
                            okText="确认"
                            cancelText="取消"
                            onConfirm={() => {
                                request.get(
                                    `/hotel/hotelRoomNumber/remove?id=${record.id}`
                                ).then((res) => {
                                    if (res.code === 0) {
                                        location.reload();
                                    }
                                }).catch((e) => {});
                            }}
                        >
                            <a>删除</a>
                        </Popconfirm>
                    }
                </Space>
            )
        }
    ]

    /**
     * 获取回显图片
     * @param ids 需要回显的图片的ID
     * @returns 
     */
    getPicFile = (ids: Array<string>) => {
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
     * 打开酒店客房基本信息编辑页面
     * @param record 客房信息
     */
    openRoomInfoDrawer = async (record: any) => {
        if (record && record.props.text.coverPicList?.length > 0) {
            this.setState({
                coverPicList: this.getPicFile(record.props.text.coverPicList),
                uploadCoverPicList: record.props.text.coverPicList
            })
        }
        if (record && record.props.text.detailPicList?.length > 0) {
            this.setState({
                detailPicList: this.getPicFile(record.props.text.detailPicList),
                uploadDetailPicList: record.props.text.detailPicList
            })
        }
        this.setState({
            showDrawer: true,
            drawerAction: 'edit',
            theIdOfUpdate: record.props.text.id,
        }, () => {
            this.ref.current?.setFieldsValue({ ...record.props.text, tag: record.props.text.tagList, coverImage: this.state.uploadCoverPicList, detailImages: this.state.uploadDetailPicList });
        });
    }

    /**
     * 关闭酒店客房信息编辑页面
     */
    closeRoomInfoDrawer = () => {
        this.setState({
            showDrawer: false,
            theIdOfUpdate: undefined,
            coverPicList: [],
            uploadCoverPicList: [],
            detailPicList: [],
            uploadDetailPicList: []
        }, () => {
            this.ref.current?.setFieldsValue({
                hotelId: undefined, name: undefined, bedType: undefined, perpleNumber: undefined, minimumArea: undefined, maximumArea: undefined,
                price: undefined, tag: [], extraPrice: undefined, roomNumber: undefined
            })
        })
    }

    /**
     * 新增或修改酒店客房信息
     * @param params 酒店客房信息
     */
    modifyHotelRoomInfo = async (params: any) => {
        params.coverImage = null;
        params.detailImages = null;
        params.tagList = params.tag;
        params.tag = null;
        await request.post(
            this.state.drawerAction === 'add' ? '/hotel/hotelRoom/add' : 'hotel/hotelRoom/update',
            {
                id: this.state.theIdOfUpdate,
                coverPicList: this.state.uploadCoverPicList,
                detailPicList: this.state.uploadDetailPicList,
                ...params
            }
        ).then((res) => {
            if (res.code === 0) {
                this.closeRoomInfoDrawer();
                this.loadDataToTable(1, 10);
            }
        })
    }

    loadDataToTable = async (page?: number, size?: number) => {
        await request.post(
            '/hotel/hotelRoom/pageList',
            {
                page: page || this.state.page,
                size: size || this.state.size,
                ...this.state.queryParam
            }
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    allRooms: res.data.data,
                    roomTotal: res.data.count
                })
            }
        }).catch((e) => {});
    }

    componentDidMount () {
        this.loadDataToTable();

        request.get(
            '/dict/listByParentCode?code=ROOM_STATUS', 
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    allStatus: res.data
                })
            }
        }).catch((e) => {});
    }

    render () {
        return (
            <PageContainer>
                <ProTable
                    headerTitle="客房信息"
                    columns={this.columns}
                    expandable={{
                        expandedRowRender: (record: any) => {
                            return (
                                <Table
                                    columns={this.roomNumberColumns}
                                    dataSource={record?.roomNumberList}
                                    pagination={false}
                                    rowKey={'id'}
                                >
                                </Table>
                            )
                        }
                    }}
                    scroll={{ x: 1300 }}
                    dataSource={this.state.allRooms}
                    pagination={{
                        total: this.state.roomTotal,
                        pageSize: this.state.size,
                        showSizeChanger: false,
                        current: Number(this.state.page)
                    }}
                    rowKey={'id'}
                    search={{
                        optionRender: ({ searchText, resetText }, {form}) => {
                            return [
                                <Button
                                    key="searchBtn"
                                    onClick={() => {
                                        form?.submit();
                                    }}
                                    type="primary"
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
                    toolBarRender={() => [
                        <Button
                            key="addHotelRoomBtn"
                            onClick={() => {
                                this.setState({
                                    showDrawer: true,
                                    drawerAction: 'add'
                                })
                            }}
                            type="primary"
                        >
                            <PlusOutlined />新增
                        </Button>
                    ]}
                    options={{density: false, reload: false}}
                    onSubmit={async (values: any) => {
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
                    onChange={async (pagination) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
                                    page: Number(pagination.current),
                                    size: Number(pagination.pageSize)
                                })
                            )
                        }).then((res) => {
                            this.loadDataToTable();
                        })
                    }}
                />

                {/* 客房基本信息 */}
                <Drawer
                    title="客房信息"
                    width="520px"
                    onClose={() => {
                        this.closeRoomInfoDrawer();
                    }}
                    visible={this.state.showDrawer}
                >
                    <Form
                        layout="vertical"
                        ref={this.ref}
                        onFinish={async (values: any) => {
                            this.modifyHotelRoomInfo(values);
                        }}
                    >
                        <Form.Item
                            name="hotelId"
                            label="酒店ID"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '酒店ID为必填项'
                                }
                            ]}
                            tooltip="可从酒店信息复制，以绑定酒店和客房信息"
                        >
                            <Input placeholder="酒店ID" />
                        </Form.Item>

                        <Form.Item
                            name="name"
                            label="名称"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '客房名称不能为空'
                                }
                            ]}
                        >
                            <Input placeholder="客房名称" />
                        </Form.Item>

                        <Form.Item
                            name="bedType"
                            label="床型"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '床型不能为空'
                                }
                            ]}
                        >
                            <Input placeholder="床型" />
                        </Form.Item>

                        <Form.Item
                            name="peopleNumber"
                            label="入住人数"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '入住人数不能为空',
                                },
                                {
                                    pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                    message: "请输入正整数"
                                }
                            ]}
                        >
                            <Input placeholder="入住人数" addonAfter="人" style={{ width: '40%' }} />
                        </Form.Item>

                        <Space size={66}>
                            <Form.Item
                                name="minimumArea"
                                label="最小面积"
                                required
                                rules={[
                                    {
                                        required: true,
                                        message: '最小面积不能为空'
                                    },
                                    {
                                        pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                        message: '请输入正整数'
                                    }
                                ]}
                            >
                                <Input placeholder="最小面积" addonAfter="㎡" />
                            </Form.Item>

                            <Form.Item
                                name="maximumArea"
                                label="最大面积"
                                required
                                rules={[
                                    {
                                        required: true,
                                        message: '最小面积不能为空'
                                    },
                                    {
                                        pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                        message: '请输入正整数'
                                    }
                                ]}
                            >
                                <Input placeholder="最大面积" addonAfter="㎡" />
                            </Form.Item>
                        </Space>

                        <Form.Item
                            name="price"
                            label="价格"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '价格不能为空'
                                },
                                {
                                    pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                    message: '请输入正整数'
                                }
                            ]}
                        >
                            <Input placeholder="价格" addonBefore='￥' />
                        </Form.Item>

                        <div style={{ marginBottom: '10px' }}>
                            <label>客房标签</label>
                        </div>
                        <Form.List
                            name="tag"
                            rules={[
                                {
                                    validator: async (_, names) => {
                                    }
                                }
                            ]}
                        >
                            {(fields, {add, remove}, {errors}) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            required={false}
                                            key={field.key}
                                        >
                                            <Form.Item
                                                {...field}
                                                validateTrigger={['onChange', 'onBlur']}
                                                rules={[
                                                    {
                                                        required: true,
                                                        whitespace: true,
                                                        message: '请输入客房标签'
                                                    }
                                                ]}
                                                noStyle
                                            >
                                                <Input placeholder="客房标签" style={{ width: '60%' }} />
                                            </Form.Item>
                                            {fields.length >= 1 ? (
                                                <MinusCircleOutlined
                                                    style={{ marginLeft: '5px' }}
                                                    onClick={() => {
                                                        remove(field.name)
                                                    }}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            icon={<PlusOutlined />}
                                        >
                                            添加标签
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>

                        <Form.Item
                            name="extraPrice"
                            label="额外费用"
                            tooltip="例如：加床费用，房间设施损坏赔偿等"
                        >
                            <Input.TextArea placeholder="客房额外费用，例如：加床费用，房间设施损坏赔偿等" />
                        </Form.Item>

                        <Form.Item
                            name="roomNumber"
                            label="客房门牌号"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '客房门牌号不能为空'
                                }
                            ]}
                        >
                            <Input.TextArea disabled={this.state.drawerAction === 'edit'} placeholder="客房门牌号，若有多个请以-进行分隔" />
                        </Form.Item>

                        <Form.Item
                            name="coverImage"
                            label="封面图片"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '至少一张图片'
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
                                        uploadCoverPicList: picIds,
                                        coverPicList: upload.fileList
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
                            label="详情图"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '至少一张图片'
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
                                        picIds.push(upload.fileList[i]?.response?.data)
                                    }
                                    this.setState({
                                        uploadDetailPicList: picIds,
                                        detailPicList: upload.fileList
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
                                <Button htmlType="submit" type="primary">提交</Button>
                                <Button htmlType="button" onClick={() => { this.closeRoomInfoDrawer() }}>取消</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Drawer>

                {/* 客房门牌号以及状态信息 */}
                <ModalForm
                    formRef={this.formRef}
                    title="客房门牌号及状态"
                    width="520px"
                    visible={this.state.showRoomNumberModalForm}
                    onVisibleChange={(showOrNot) => {
                        if (!showOrNot) {
                            this.setState({
                                showRoomNumberModalForm: false
                            })
                        }
                    }}
                    onFinish={async (values: any) => {
                        await request.post(
                            '/web/hotelRoomNumber/modify',
                            {
                                ...values
                            }
                        ).then((res) => {
                            if (res.code === 0) {
                                this.loadDataToTable();
                                this.setState({
                                    showRoomNumberModalForm: false
                                });
                            }
                        }).catch((e) => {});
                    }}
                >
                    <Form.Item
                        name="id"
                        hidden={true}
                    >
                    </Form.Item>
                    <Form.Item
                        name="roomNumber"
                        label="门牌号"
                        required
                        rules={[
                            {
                                required: true,
                                message: '门牌号不能为空'
                            }
                        ]}
                    >
                        <Input placeholder="门牌号" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="状态"
                        required
                        rules={[
                            {
                                required: true,
                                message: '客房状态为必选项'
                            }
                        ]}
                    >
                        <Select
                            disabled
                        >
                            {
                                this.state.allStatus.map((item: any) => {
                                    return (
                                        <Select.Option value={item.code} key={item.code}>
                                            {item.value}
                                        </Select.Option>
                                    )
                                })
                            }
                        </Select>
                    </Form.Item>

                    <Space>
                        <Form.Item
                            name="price"
                            label="价格"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '请输入价格'
                                },
                                {
                                    pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                    message: '请输入正整数'
                                }
                            ]}
                        >
                            <Input placeholder="价格" addonBefore="￥" />
                        </Form.Item>

                        <Form.Item
                            name="area"
                            label="面积"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '请输入面积'
                                },
                                {
                                    pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                    message: '请输入正整数'
                                }
                            ]}
                        >
                            <Input placeholder="面积" addonAfter="㎡" />
                        </Form.Item>
                    </Space>
                </ModalForm>
            </PageContainer>
        )
    }
}