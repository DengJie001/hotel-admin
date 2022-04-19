import { request } from "@/utils/request";
import { PlusOutlined } from "@ant-design/icons";
import { ModalForm, ProFormInstance } from "@ant-design/pro-form";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, Form, Input, Popconfirm, Select, Space } from "antd";
import React from "react";

interface State {
    allCities: Array<any>;
    allParentCities: Array<any>;
    showVisible: boolean;
    modalTitle: string;
    theIdOfUpdate?: string;
}

export default class City extends React.Component<{}, State> {
    formRef = React.createRef<ProFormInstance>();

    state: State = {
        allCities: [],
        showVisible: false,
        modalTitle: '新增',
        allParentCities: []
    }

    columns = [
        {
            title: '名称',
            dataIndex: 'name',
            hideInSearch: true,
        },
        {
            title: '城市拼音',
            dataIndex: 'phonics',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            render: (record: any) => (
                <Space>
                    <a
                        onClick={() => {
                            this.openModalForm(record);
                        }}
                    >
                        编辑
                    </a>
                    <Popconfirm
                        title="是否确认删除"
                        okText="确认"
                        cancelText="取消"
                        onConfirm={() => {
                            this.removeCityInfo(record.props.text.id);
                        }}
                    >
                        <a>删除</a>
                    </Popconfirm>
                </Space>
            )
        }
    ]

    openModalForm = (record: any) => {
        this.setState({
            theIdOfUpdate: record.props.text.id,
            modalTitle: '编辑',
            showVisible: true
        }, () => {
            this.formRef.current?.setFieldsValue({ ...record.props.text });
        });
    }

    clearModalForm = () => {
        this.setState({
            theIdOfUpdate: undefined,
            showVisible: false,
        }, () => {
            this.formRef.current?.setFieldsValue({
                name: undefined, phonics: undefined, parentCityId: undefined
            })
        })
    }

    updateCityInfo = async (values: any) => {
        await request.post(
            '/city/modify',
            {
                id: this.state.theIdOfUpdate,
                ...values
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
                this.clearModalForm();
            }
        })
    }

    removeCityInfo = async (id: string) => {
        request.post(
            '/city/remove',
            {
                id: id
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
            }
        }).catch((e) => {});
    }

    loadDataToTable = async () => {
        await request.post(
            '/city/listAllCities'
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

        request.post(
            '/city/listAllParentCities'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    allParentCities: res.data
                })
            }
        }).catch((e) => {});
    }

    render() {
        return (
            <PageContainer>
                <ProTable
                    headerTitle="城市管理"
                    columns={this.columns}
                    dataSource={this.state.allCities}
                    pagination={false}
                    search={false}
                    rowKey={'id'}
                    toolBarRender={() => [
                        <Button
                            key="addCityBtn"
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
                />
                <ModalForm
                    formRef={this.formRef}
                    title={this.state.modalTitle}
                    width='520px'
                    visible={this.state.showVisible}
                    onVisibleChange={(showOrNot) => {
                        if (!showOrNot) {
                            this.clearModalForm();
                        }
                    }}
                    onFinish={async (values: any) => {
                        await this.updateCityInfo(values);
                    }}
                >
                    <Form.Item
                        name="name"
                        label="城市名称"
                        required
                        rules={[
                            {
                                required: true,
                                message: '城市名称不能为空'
                            }
                        ]}
                    >
                        <Input placeholder="城市名称" />
                    </Form.Item>

                    <Form.Item
                        name="phonics"
                        label="城市拼音"
                        required
                        rules={[
                            {
                                required: true,
                                message: '城市拼音不能为空'
                            }
                        ]}
                    >
                        <Input placeholder="城市拼音" />
                    </Form.Item>

                    <Form.Item
                        name="parentCityId"
                        label="省份(直辖市)"
                    >
                        <Select>
                            <Select.Option value={null} key={null}>
                                ---当前城市就是省份(直辖市)---
                            </Select.Option>
                            {
                                this.state.allParentCities.map((item: any) => {
                                    return (
                                        <Select.Option value={item.id} key={item.id}>
                                            {item.name}
                                        </Select.Option>
                                    )
                                })
                            }
                        </Select>
                    </Form.Item>
                </ModalForm>
            </PageContainer>
        )
    }
}