import { request } from "@/utils/request";
import { PlusOutlined } from "@ant-design/icons";
import { ModalForm, ProFormInstance } from "@ant-design/pro-form";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, Form, Input, Popconfirm, Select, Space } from "antd";
import React from "react";

interface State {
    resources: Array<any>;
    resourceTotal: number;
    page: number;
    size: number;
    theIdOfUpdate?: string;
    allParentResources: Array<any>;
    showVisible: boolean;
    modalTitle: string;
}

export default class Resource extends React.Component<{}, State> {
    formRef = React.createRef<ProFormInstance>();

    state: State = {
        resources: [],
        resourceTotal: 0,
        page: 1,
        size: 10,
        allParentResources: [],
        showVisible: false,
        modalTitle: '新增'
    }

    columns = [
        {
            title: '名称',
            dataIndex: 'name',
            hideInSearch: true,
        },
        {
            title: '路径',
            dataIndex: 'path',
            hideInSearch: true,
        },
        {
            title: '描述',
            dataIndex: 'description',
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
                        onConfirm={async () => {
                            this.removeResource(record.props.text.id);
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
            showVisible: true,
            modalTitle: '编辑',
            theIdOfUpdate: record.props.text.id
        }, () => {
            this.formRef.current?.setFieldsValue({ ...record.props.text });
        });
    }

    clearModalForm = () => {
        this.setState({
            showVisible: false,
            theIdOfUpdate: undefined
        }, () => {
            this.formRef.current?.setFieldsValue({
                name: undefined, parentId: undefined, path: undefined, description: undefined
            })
        })
    }

    removeResource = async (id: string) => {
        await request.post(
            '/sys/resource/remove',
            {
                id: id
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
            }
        }).catch((e) => {});
    }

    updateResource = async (params: any) => {
        if (!params?.parentId) {
            params.parentId = null;
        }
        await request.post(
            '/sys/resource/modify',
            {
                id: this.state.theIdOfUpdate,
                ...params
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
                this.clearModalForm();
            }
        }).catch((e) => {});
    }

    loadDataToTable = async () => {
        await request.post(
            '/sys/resource/list'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    resources: res.data
                })
            }
        }).catch((e) => {});

        await request.post(
            '/sys/resource/listAllParent',
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    allParentResources: res.data
                })
            }
        }).catch((e) => {});
    }

    componentDidMount () {
        this.loadDataToTable();
    }

    render () {
        return (
            <PageContainer>
                <ProTable
                    headerTitle="资源管理"
                    columns={this.columns}

                    dataSource={this.state.resources}
                    pagination={false}
                    rowKey={'id'}
                    search={false}
                    toolBarRender={() => [
                        <Button
                            key='addResourceBtn'
                            onClick={() => {
                                this.setState({
                                    showVisible: true
                                })
                            }}
                            type="primary"
                        >
                            <PlusOutlined />新增
                        </Button>
                    ]}
                    options={{density: false, reload: false }}
                    onSubmit={async (values: any) => {

                    }}
                    onReset={async () => {

                    }}
                    onChange={async () => {

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
                    onFinish={async (values: any) => {
                        await this.updateResource(values);
                    }}
                >
                    <Form.Item
                        name="name"
                        label="资源名称"
                        required
                        rules={[
                            {
                                required: true,
                                message: '资源名称不能为空'
                            }
                        ]}
                    >
                        <Input placeholder="资源名称" />
                    </Form.Item>

                    <Form.Item
                        name="parentId"
                        label="父级资源"
                        required
                    >
                        <Select>
                            <Select.Option value="" key="">
                                ---不需要父级资源---
                            </Select.Option>
                            {
                                this.state.allParentResources.map((item: any) => {
                                    return (
                                        <Select.Option value={item.id} key={item.id}>
                                            {
                                                item.name
                                            }
                                        </Select.Option>
                                    )
                                })
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="path"
                        label="路径"
                        required
                        rules={[
                            {
                                required: true,
                                message: '路径不能为空'
                            }
                        ]}
                    >
                        <Input placeholder="资源路径" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="资源描述"
                    >
                        <Input placeholder="资源描述" />
                    </Form.Item>
                </ModalForm>
            </PageContainer>
        )
    }
}