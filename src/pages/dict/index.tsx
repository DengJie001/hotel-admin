import { request } from "@/utils/request";
import { PlusOutlined } from "@ant-design/icons";
import { ModalForm, ProFormInstance } from "@ant-design/pro-form";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, Form, Input, Popconfirm, Select, Space } from "antd";
import React from "react";

interface State {
    showModalForm: boolean;
    dictList: Array<any>;
    allParentDictList: Array<any>
}

export default class Dict extends React.Component<{}, State> {
    formRef = React.createRef<ProFormInstance>();

    state: State = {
        showModalForm: false,
        dictList: [],
        allParentDictList: []
    }

    columns = [
        {
            title: '父级字典',
            dataIndex: 'parentCode',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '字典项名称',
            dataIndex: 'name',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '字典编码',
            dataIndex: 'code',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '字典值',
            dataIndex: 'value',
            hideInSearch: true,
            align: 'center',
        },
        {
            title: '备注',
            dataIndex: 'remarks',
            hideInSearch: true,
            ellipsis: true,
            align: 'center'
        },
        {
            title: '操作',
            valueType: 'option',
            render: (record: any) => {
                return (
                    <Space>
                        <a
                            onClick={() => {
                                this.openModalForm(record);
                            }}
                        >编辑</a>
                        <Popconfirm
                            title="是否确认删除"
                            okText="确认"
                            cancelText="取消"
                            onConfirm={() => {
                                this.removeDict(record.props.text.id);
                            }}
                        >
                            <a>删除</a>
                        </Popconfirm>
                    </Space>
                )
            }
        }
    ]

    /**
     * 打开字典编辑页面
     * @param record 字典数据
     */
    openModalForm = (record: any) => {
        this.setState({
            showModalForm: true
        }, () => {
            this.formRef.current?.setFieldsValue({ ...record.props.text });
        });
    }

    /**
     * 关闭字典项信息编辑页面
     */
    closeModalForm = () => {
        this.setState({
            showModalForm: false
        }, () => {
            this.formRef.current?.setFieldsValue({
                id: null, name: undefined, parentCode: null, code: null, value: null, remarks: null
            })
        })
    }

    /**
     * 新增或修改字典项数据
     * @param values 字典项信息
     */
    modifyDictInfo = async (values: any) => {
        await request.post(
            '/dict/modify',
            {
                ...values
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
                this.closeModalForm();
            }
        }).catch((e) => {});
    }

    removeDict = async (id: string) => {
        await request.get(
            `/dict/remove?id=${id}`
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
            }
        }).catch((e) => {});
    }

    /**
     * 初始化表格数据
     */
    loadDataToTable = async () => {
        await request.get(
            '/dict/pageList'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    dictList: res.data
                })
            }
        }).catch((e) => {});

        await request.get(
            '/dict/listAllParentDict'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    allParentDictList: res.data
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
                    headerTitle="字典管理"
                    columns={this.columns}
                    dataSource={this.state.dictList}
                    pagination={false}
                    rowKey={'id'}
                    search={false}
                    toolBarRender={() => [
                        <Button
                            key="addDictBtn"
                            type="primary"
                            onClick={() => {
                                this.setState({
                                    showModalForm: true
                                })
                            }}
                        >
                            <PlusOutlined />新增
                        </Button>
                    ]}
                    options={{ density: false, reload: false }}
                />
                <ModalForm
                    formRef={this.formRef}
                    title="字典信息"
                    width='520px'
                    visible={this.state.showModalForm}
                    onVisibleChange={(showOrNot) => {
                        if (!showOrNot) {
                            this.closeModalForm()
                        }
                    }}
                    onFinish={async (values: any) => {
                        this.modifyDictInfo(values);
                    }}
                >
                    <Form.Item
                        name="id"
                        label="id"
                        hidden={true}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="字典项名称"
                        required
                        rules={[
                            {
                                required: true,
                                message: '字典项名称为必填项'
                            }
                        ]}
                    >
                        <Input placeholder="字典项名称" />
                    </Form.Item>

                    <Form.Item
                        name="parentCode"
                        label="父级字典"
                    >
                        <Select>
                            <Select.Option value={null} key={null}>
                                ---不需要父级字典---
                            </Select.Option>
                            {
                                this.state.allParentDictList.map((item: any) => {
                                    return (
                                        <Select.Option value={item.code} key={item.code}>
                                            {item.name}
                                        </Select.Option>
                                    )
                                })
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="字典项编码"
                        required
                        rules={[
                            {
                                required: true,
                                message: '字典项编码为必填项'
                            }
                        ]}
                    >
                        <Input placeholder="字典项编码" />
                    </Form.Item>

                    <Form.Item
                        name="value"
                        label="字典值"
                        required
                        rules={[
                            {
                                required: true,
                                message: '字典值不能为空'
                            }
                        ]}
                    >
                        <Input placeholder="字典值" />
                    </Form.Item>

                    <Form.Item
                        name="remarks"
                        label="备注"
                    >
                        <Input placeholder="备注" />
                    </Form.Item>
                </ModalForm>
            </PageContainer>
        )
    }
}