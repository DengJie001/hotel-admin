import { request } from "@/utils/request";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { ProFormInstance } from "@ant-design/pro-form";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, DatePicker, Drawer, Form, FormInstance, Input, Popconfirm, Select, Space, Switch, Tag, Tooltip, Upload } from "antd";
import TextArea from "antd/lib/input/TextArea";
import moment from "moment";
import React from "react";

interface State {
    page: number;
    size: number;
    theIdOfUpdate?: string;
    allHotelInfo: Array<any>;
    allCities: Array<any>;
    drawerTitle: string;
    hotelInfoTotal: number;
    queryParam?: any;
    showDrawer: boolean;
    openYear?: string;
    showPolicyDrawer: boolean;
    showFacilityDrawer: boolean;
    coverPicList: Array<any>;
    uploadCoverPicList: Array<any>;
    detailPicList: Array<any>;
    uploadDetailPicList: Array<any>;
    thePoliceId?: string;
    theFacilityId?: string;
}

export default class HotelInfo extends React.Component<{}, State> {
    ref = React.createRef<FormInstance>();

    state: State = {
        page: 1,
        size: 10,
        allHotelInfo: [],
        allCities: [],
        drawerTitle: "新增",
        hotelInfoTotal: 0,
        showDrawer: false,
        showPolicyDrawer: false,
        showFacilityDrawer: false,
        coverPicList: [],
        detailPicList: [],
        uploadCoverPicList: [],
        uploadDetailPicList: []
    }

    columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            hideInSearch: true,
            copyable: true,
            ellipsis: true,
            align: 'center',
        },
        {
            title: '名称',
            dataIndex: 'name',
            hideInSearch: false,
            ellipsis: true,
            align: 'center',
        },
        {
            title: '地址',
            dataIndex: 'address',
            hideInSearch: true,
            ellipsis: true,
            align: 'center',
        },
        {
            title: '酒店介绍',
            dataIndex: 'description',
            hideInSearch: true,
            ellipsis: true,
            align: 'center',
        },
        {
            title: '开业时间',
            dataIndex: 'openYear',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '联系方式',
            dataIndex: 'telNumber',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '最低价',
            dataIndex: 'minimumPrice',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '最高价',
            dataIndex: 'maximumPrice',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '首页推荐',
            dataIndex: 'recommend',
            hideInSearch: true,
            align: 'center',
            render: (_: any, record: any) => {
                return (
                    <Switch
                        checked={record.recommend}
                        onChange={async (recommend) => {
                            await request.get(
                                `/hotel/hotelInfo/modifyRecommend?id=${record.id}&recommend=${recommend}`
                            ).then((res) => {
                                if (res.code === 0) {
                                    this.loadDataToTable();
                                }
                            }).catch((e) => {});
                        }}
                    />
                )
            }
        },
        {
            title: '推荐标题',
            dataIndex: 'title',
            hideInSearch: true,
            align: 'center',
            ellipsis: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 260,
            align: 'center',
            render: (record: any) => (
                <Space>
                    <a
                        onClick={() => {
                            this.openHotelInfoDrawer(record);
                        }}
                    >
                        编辑
                    </a>
                    <a
                        onClick={() => {
                            this.openHotelPolicyDrwaer(record.props.text.id);
                        }}
                    >
                        酒店政策
                    </a>
                    <a
                        onClick={() => {
                            this.openHotelFacilityDrwaer(record.props.text.id);
                        }}
                    >
                        酒店设施
                    </a>
                    <Popconfirm
                        title="是否确认删除"
                        okText="确认"
                        cancelText="取消"
                        onConfirm={() => {
                            this.removeHotelnfo(record.props.text.id);
                        }}
                    >
                        <a>删除</a>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    /**
     * 封装图片
     * @param ids 图片ID数组 
     * @returns 
     */
    getPicFile = async (ids: Array<string>) => {
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
     * 打开酒店基本信息编辑页面
     * @param record 酒店原来的基本信息
     */
    openHotelInfoDrawer = async (record: any) => {
        if (record && record.props.text.coverPicList) {
            var coverPicFiles = await this.getPicFile(record.props.text.coverPicList);
            this.setState({
                uploadCoverPicList: record.props.text.coverPicList,
                coverPicList: coverPicFiles
            });
        }
        if (record && record.props.text.detailPicList) {
            var detailPicFiles = await this.getPicFile(record.props.text.detailPicList);
            this.setState({
                uploadDetailPicList: record.props.text.detailPicList,
                detailPicList: detailPicFiles
            })
        }
        console.log(this.state.coverPicList);
        this.setState({
            showDrawer: true,
            theIdOfUpdate: record.props.text.id,
            openYear: record.openYear || new Date().getFullYear()
        }, () => {
            this.ref.current?.setFieldsValue({ ...record.props.text, openYear: moment(this.state.openYear, 'yyyy'), tag:  record.props.text.tagList});
        })
    }

    /**
     * 关闭酒店基本信息编辑页面
     */
    closeHotelInfoDrwaer = async () => {
        this.setState({
            showDrawer: false,
            theIdOfUpdate: undefined,
            coverPicList: [],
            detailPicList: []
        }, () => {
            this.ref.current?.setFieldsValue({
                name: undefined, cityId: [], address: undefined, description: undefined, 
                telNumber: undefined, minimumPrice: undefined, maximumPrice: undefined,
                tag: undefined, coverImage: undefined, detailImages: undefined
            })
        })
    }

    /**
     * 打开酒店政策信息编辑页面
     * @param hotelId
     */
    openHotelPolicyDrwaer = async (hotelId: string) => {
        // 判断是新增还是修改政策信息，如果原来有就是修改反之则是新增
        await request.get(
            `/web/hotelPolicy/queryByHotelId/${hotelId}`
        ).then((res) => {
            if (res.code === 0 && !res.data?.exist) {
                this.setState({
                    showPolicyDrawer: true,
                    theIdOfUpdate: hotelId,
                });
            } else if (res.code === 0 && res.data?.exist) {
                this.setState({
                    showPolicyDrawer: true,
                    thePoliceId: res.data.data.id
                }, () => {
                    this.ref.current?.setFieldsValue({ ...res.data.data })
                })
            }
        }).catch((e) => {});
    }

    /**
     * 关闭酒店政策编辑页面
     */
    closeHotelPolicyDrwaer = async () => {
        this.setState({
            thePoliceId: undefined,
            showPolicyDrawer: false
        }, () => {
            this.ref.current?.setFieldsValue({
                importantNotice: undefined, hotelTips: undefined, cityNotice: undefined,
                childrenPolicy: undefined, petPolicy: undefined, agePolicy: undefined,
                bookingPolicy: undefined, breakfastPolicy: undefined
            });
        });
    }

    /**
     * 打开酒店设施编辑页面
     * @param hotelId 酒店ID
     */
    openHotelFacilityDrwaer = async (hotelId: string) => {
        await request.get(
            `/web/hotelFacility/queryByHotelId/${hotelId}`
        ).then((res) => {
            if (res.code === 0 && !res.data?.exist) {
                this.setState({
                    showFacilityDrawer: true,
                    theIdOfUpdate: hotelId,
                });
            } else if (res.code === 0 && res.data?.exist) {
                this.setState({
                    showFacilityDrawer: true,
                    theIdOfUpdate: hotelId,
                    theFacilityId: res.data.data.id
                }, () => {
                    this.ref.current?.setFieldsValue({ ...res.data.data });
                })
            }
        })
    }

    /**
     * 关闭酒店设施编辑页面
     */
    closeHotelFacilityDrawer = async () => {
        this.setState({
            showFacilityDrawer: false,
            theIdOfUpdate: undefined,
            theFacilityId: undefined,
        }, () => {
            this.ref.current?.setFieldsValue({
                hotFacility: undefined, entertainmentFacility: undefined, frontDeskService: undefined, cleaningService: undefined, cateringService: undefined, otherService: undefined,
                publicArea: undefined, businessService: undefined, generalFacility: undefined
            })
        })
    }

    /**
     * 新增或修改酒店政策信息
     * @param params 酒店政策信息
     */
    modifyHotelPolicyInfo = async (params: any) => {
        await request.post(
            '/web/hotelPolicy/modify',
            {
                id: this.state.thePoliceId,
                hotelId: this.state.theIdOfUpdate,
                ...params
            }
        ).then((res) => {
            if (res.code === 0) {
                this.closeHotelPolicyDrwaer();
            }
        }).catch((e) => {})
    }

    /**
     * 新增或修改酒店设施信息
     * @param params 酒店设施信息
     */
    modifyHotelFacilityInfo = async (params: any) => {
        await request.post(
            '/web/hotelFacility/modify',
            {
                id: this.state.theFacilityId,
                hotelId: this.state.theIdOfUpdate,
                ...params
            }
        ).then((res) => {
            if (res.code === 0) {
                this.closeHotelFacilityDrawer();
            }
        }).catch((e) => {});
    }

    /**
     * 新增或修改酒店信息
     * @param params 酒店基本信息
     */
    modifyHotelInfo = async (params: any) => {
        params.coverImage = null;
        params.detailImages = null;
        params.openYear = this.state.openYear;
        params.tagList = params.tag;
        params.tag = null;
        await request.post(
            '/hotel/hotelInfo/modify',
            {
                id: this.state.theIdOfUpdate,
                tagList: params?.tag,
                coverPicList: this.state.uploadCoverPicList,
                detailPicList: this.state.uploadDetailPicList,
                ...params
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
                this.closeHotelInfoDrwaer();
            }
        }).catch((e) => {});
    }

    /**
     * 删除酒店信息
     * @param id 酒店ID
     */
    removeHotelnfo = async (id: string) => {
        await request.post(
            '/hotel/hotelInfo/remove',
            {
                id: id
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
            }
        })
    }

    /**
     * 初始化表格数据
     * @param page 当前页
     * @param size 每页数据量
     */
    loadDataToTable = async (page?: number, size?: number) => {
        await request.post(
            '/hotel/hotelInfo/pageList',
            {
                page: page || this.state.page,
                size: size || this.state.size
            }
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    allHotelInfo: res.data.data,
                    hotelInfoTotal: res.data.count
                })
            }
        }).catch((e) => {});

        await request.post(
            '/city/listAllSonCities'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    allCities: res.data
                })
            }
        }).catch((e) => {});
    }

    componentDidMount() {
        this.loadDataToTable();
    }

    render () {
        return (
            <PageContainer>
                <ProTable
                    headerTitle="酒店信息"
                    columns={this.columns}
                    scroll={{ x: 1300 }}
                    dataSource={this.state.allHotelInfo}
                    pagination={{
                        total: this.state.hotelInfoTotal,
                        showSizeChanger: false,
                        pageSize: this.state.size,
                        current: Number(this.state.page)
                    }}
                    rowKey={'id'}
                    search={{
                        labelWidth: 'auto',
                        optionRender: ({ searchText, resetText }, { form }) => {
                            return [
                                <Button
                                    key='searchHotelInfoBtn'
                                    type="primary"
                                    onClick={() => {
                                        form?.submit();
                                    }}
                                >
                                    { searchText }
                                </Button>,
                                <Button
                                    key='resetHotelInfoBtn'
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
                                    { resetText }
                                </Button>
                            ]
                        }
                    }}
                    toolBarRender = {() => [
                        <Button
                            key="addHotelBtn"
                            onClick={() => {
                                this.setState({
                                    showDrawer: true
                                })
                            }}
                            type="primary"
                        >
                            <PlusOutlined />新增
                        </Button>
                    ]}
                    options={{density: false, reload: false}}
                    onSubmit={ async (values: any) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
                                    queryParam: values
                                })
                            )
                        }).then(() => {
                            request.post(
                                '/hotel/hotelInfo/pageList',
                                {
                                    page: this.state.page,
                                    size: this.state.size,
                                    ...this.state.queryParam
                                }
                            ).then((res) => {
                                if (res.code === 0) {
                                    this.setState({
                                        allHotelInfo: res.data.data,
                                        hotelInfoTotal: res.data.count
                                    })
                                }
                            }).catch((e) => {});
                        })
                    }}
                    onChange={async (pagination) => {
                        new Promise((resolve) => {
                            resolve(
                                this.setState({
                                    page: Number(pagination?.current),
                                    size: Number(pagination?.pageSize)
                                })
                            )
                        }).then(() => {
                            request.post(
                                '/hotel/hotelInfo/pageList',
                                {
                                    page: pagination?.current || this.state.page,
                                    size: pagination?.pageSize || this.state.size,
                                    ...this.state.queryParam
                                }
                            ).then((res) => {
                                if (res.code === 0) {
                                    this.setState({
                                        allHotelInfo: res.data.data,
                                        hotelInfoTotal: res.data.count
                                    })
                                }
                            }).catch((e) => {});
                        })
                    }}
                />
                {/* 酒店基本信息 */}
                <Drawer
                    title="酒店信息"
                    width='520px'
                    onClose={() => {
                        this.closeHotelInfoDrwaer();
                    }}
                    visible={this.state.showDrawer}
                >
                    <Form
                        layout="vertical"
                        ref={this.ref}
                        onFinish={async (params) => {
                            console.log('抽屉数据')
                            console.log(params)
                            await this.modifyHotelInfo(params);
                        }}
                    >
                        <Form.Item
                            name="name"
                            label="酒店名称"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '酒店名称不能为空'
                                }
                            ]}
                        >
                            <Input placeholder="酒店名称" />
                        </Form.Item>

                        <Form.Item
                            name="cityId"
                            label="所在城市"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '城市为必选项'
                                }
                            ]}
                        >
                            <Select
                                showSearch
                                optionFilterProp="children"
                                onSearch={async (value) => {
                                    var targetCities: any[] = [];
                                    new Promise((resolve) => {
                                        for (let i = 0; i < this.state.allCities.length; ++i) {
                                            if (this.state.allCities[i].name.includes(value)) {
                                                targetCities.push(this.state.allCities[i]);
                                            }
                                        }
                                    }).then(() => {
                                        this.setState({
                                            allCities: targetCities
                                        })
                                    })
                                }}
                            >
                                {
                                    this.state.allCities.map((item: any) => {
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
                            name="address"
                            label="酒店地址"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '酒店地址不能为空'
                                }
                            ]}
                        >
                            <Input placeholder="酒店地址" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="酒店介绍"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '酒店介绍不能为空'
                                }
                            ]}
                        >
                            <Input.TextArea placeholder="酒店介绍" />
                        </Form.Item>

                        <Form.Item
                            name="openYear"
                            label="开业时间"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '开业时间为必选项'
                                }
                            ]}
                        >
                            <DatePicker
                                allowClear
                                picker="year"
                                onChange={(moment, builtYear) => {
                                    this.setState({
                                        openYear: builtYear
                                    });
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="telNumber"
                            label="联系方式"
                            required
                            rules={[
                                {
                                    required: true,
                                    message: '联系方式为必填'
                                },
                                {
                                    pattern: new RegExp(/[0-9-()()]{7,18}/),
                                    message: '联系方式格式不正确'
                                }
                            ]}
                        >
                            <Input placeholder="联系方式" />
                        </Form.Item>

                        <Space size={66}>
                            <Form.Item
                                name="minimumPrice"
                                label="最低价(单位：分)"
                                required
                                rules={[
                                    {
                                        required: true,
                                        message: '最低价为必填项'
                                    },
                                    {
                                        pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                        message: '请输入整数，单位为分'
                                    }
                                ]}
                            >
                                <Input
                                    placeholder="最低价"
                                    addonBefore="￥"
                                />
                            </Form.Item>
                            <Form.Item
                                name="maximumPrice"
                                label="最高价(单位：分)"
                                required
                                rules={[
                                    {
                                        required: true,
                                        message: '最高价为必填项'
                                    },
                                    {
                                        pattern: new RegExp(/^[1-9]\d*$/, "g"),
                                        message: '请输入整数，单位为分'
                                    }
                                ]}
                            >
                                <Input
                                    placeholder="最高价"
                                    addonBefore="￥"
                                />
                            </Form.Item>
                        </Space>

                        <div style={{ marginBottom: '10px' }}>
                            <label>酒店标签</label>
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
                                                        message: '请输入酒店标签'
                                                    }
                                                ]}
                                                noStyle
                                            >
                                                <Input placeholder="酒店标签" style={{ width: '60%' }} />
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
                                    <div style={{ marginTop: 8 }}>
                                        上传
                                    </div>
                                </div>
                            </Upload>
                        </Form.Item>

                        <Form.Item
                            name="recommend"
                            label="首页推荐"
                            valuePropName="checked"
                        >
                            <Switch onChange={() => {}} />
                        </Form.Item>

                        <Form.Item
                            name="title"
                            label="推荐标题"
                            required
                            tooltip="当酒店被设置为推荐时，需要一个标题简短描述推荐原因"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入标题'
                                }
                            ]}
                        >
                            <Input placeholder="推荐标题" />
                        </Form.Item>

                        <Form.Item>
                            <Space size={10}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    onClick={(values) => {
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

                {/* 酒店政策 */}
                <Drawer
                    title="酒店政策"
                    width="520px"
                    onClose={() => {
                        this.closeHotelPolicyDrwaer();
                    }}
                    visible={this.state.showPolicyDrawer}
                >
                    <Form
                        layout="vertical"
                        ref={this.ref}
                        onFinish={async (values: any) => {
                            await this.modifyHotelPolicyInfo(values);
                        }}
                    >
                        <Form.Item
                            name="importantNotice"
                            label="重要通知"
                        >
                            <Input.TextArea placeholder="重要通知" />
                        </Form.Item>

                        <Form.Item
                            name="hotelTips"
                            label="酒店提示"
                        >
                            <Input.TextArea placeholder="酒店提示" />
                        </Form.Item>

                        <Form.Item
                            name="cityNotice"
                            label="城市通知"
                        >
                            <Input.TextArea placeholder="城市通知" />
                        </Form.Item>

                        <Form.Item
                            name="childrenPolicy"
                            label="儿童政策"
                        >
                            <Input.TextArea placeholder="儿童政策" />
                        </Form.Item>

                        <Form.Item
                            name="petPolicy"
                            label="宠物政策"
                        >
                            <Input.TextArea placeholder="宠物" />
                        </Form.Item>

                        <Form.Item
                            name="agePolicy"
                            label="年龄限制"
                        >
                            <Input.TextArea placeholder="年龄限制" />
                        </Form.Item>

                        <Form.Item
                            name="bookingPolicy"
                            label="预订提示"
                        >
                            <Input.TextArea placeholder="预订提示" />
                        </Form.Item>

                        <Form.Item
                            name="breakfastPolicy"
                            label="早餐"
                        >
                            <Input.TextArea placeholder="早餐政策" />
                        </Form.Item>

                        <Form.Item>
                            <Space size={10}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    onClick={() => {}}
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

                {/* 酒店设施 */}
                <Drawer
                    title="酒店设施"
                    width="520px"
                    onClose={() => {
                        this.closeHotelFacilityDrawer();
                    }}
                    visible={this.state.showFacilityDrawer}
                >
                    <Form
                        layout="vertical"
                        ref={this.ref}
                        onFinish={async (values) => {
                            this.modifyHotelFacilityInfo(values);
                        }}
                    >
                        <Form.Item
                            name="hotFacility"
                            label="热门设施"
                        >
                            <Input.TextArea placeholder="热门设施" />
                        </Form.Item>

                        <Form.Item
                            name="entertainmentFacility"
                            label="娱乐设施"
                        >
                            <Input.TextArea placeholder="娱乐设施" />
                        </Form.Item>

                        <Form.Item
                            name="frontDeskService"
                            label="前台设施"
                        >
                            <Input.TextArea placeholder="前台服务" />
                        </Form.Item>

                        <Form.Item
                            name="cleaningService"
                            label="清洁服务"
                        >
                            <Input.TextArea placeholder="清洁服务" />
                        </Form.Item>

                        <Form.Item
                            name="cateringService"
                            label="餐饮服务"
                        >
                            <Input.TextArea placeholder="餐饮服务" />
                        </Form.Item>

                        <Form.Item
                            name="otherService"
                            label="其他服务"
                        >
                            <Input.TextArea placeholder="其他服务" />
                        </Form.Item>

                        <Form.Item
                            name="publicArea"
                            label="公共区域"
                        >
                            <Input.TextArea placeholder="公共区域" />
                        </Form.Item>

                        <Form.Item
                            name="businessService"
                            label="商务服务"
                        >
                            <Input.TextArea placeholder="商务服务" />
                        </Form.Item>

                        <Form.Item
                            name="generalFacility"
                            label="公共设施"
                        >
                            <Input.TextArea placeholder="公共设施" />
                        </Form.Item>

                        <Form.Item>
                            <Space size={10}>
                                <Button
                                    htmlType="submit"
                                    type="primary"
                                >
                                    提交
                                </Button>

                                <Button
                                    htmlType="button"
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