import { request } from "@/utils/request";
import { PlusOutlined } from "@ant-design/icons";
import { ModalForm, ProFormInstance } from "@ant-design/pro-form";
import { PageContainer } from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import { Button, Form, Input, Popconfirm, Space, Tree } from "antd";
import React from "react";

interface State {
    roles: Array<any>;
    theIdOfUpdate?: string;
    showVisible: boolean;
    modalTitle: string;
    resources: Array<any>;
    allocateVisible: boolean;
    checkResourceIds: Array<string>;
    allocateResourceIds: Array<string>;
    queryParam: any;
}

export default class Role extends React.Component<{}, State> {
    formRef = React.createRef<ProFormInstance>();

    state: State = {
        roles: [],
        showVisible: false,
        modalTitle: "新增",
        resources: [],
        allocateVisible: false,
        checkResourceIds: [],
        allocateResourceIds: [],
        queryParam: {}
    }

    columns = [
        {
            title: '角色名称',
            dataIndex: 'name',
            hideInSearch: false,
        },
        {
            title: '操作',
            valueType: 'option',
            render: (record: any) => (
                <Space>
                    <a
                        onClick={async () => {
                            await this.openAllocateModalForm(record);
                        }}
                    >
                        分配资源
                    </a>
                    <a
                        onClick={() => {
                            this.openModalForm(record);
                        }}
                    >
                        编辑
                    </a>
                    <Popconfirm
                        title="是否确认删除？"
                        okText="确认"
                        cancelText="取消"
                        onConfirm={() => {
                            this.removeRole(record.props.text.id);
                        }}
                    >
                        <a>
                            删除
                        </a>
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
            this.formRef.current?.setFieldsValue({ ...record.props.text })
        });
    }

    clearModalForm = () => {
        this.setState({
            showVisible: false,
            theIdOfUpdate: undefined
        }, () => {
            this.formRef.current?.setFieldsValue({
                name: undefined
            });
        });
    }

    openAllocateModalForm = async (record: any) => {
        await request.post(
            '/sys/roleResource/listAllCheckedResource',
            {
                id: record.props.text.id
            }
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    checkResourceIds: res.data,
                    allocateResourceIds: res.data
                })
            }
        }).catch((e) => {});

        this.setState({
            theIdOfUpdate: record.props.text.id,
            allocateVisible: true
        })
    }

    clearAllocateModalForm = async () => {
        this.setState({
            theIdOfUpdate: undefined,
            checkResourceIds: [],
            allocateResourceIds: [],
            allocateVisible: false
        });
    }

    removeRole = async (id: string) => {
        await request.post(
            '/sys/role/remove',
            {
                id: id
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
            }
        }).catch((e) => {});
    }

    updateRole = async (params: any) => {
        await request.post(
            '/sys/role/modify',
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

    setQueryParam = (params: any) => {
        this.setState({
            queryParam: params
        })
    }

    loadDataToTable = async (page?: number, size?: number) => {
        await request.post(
            '/sys/role/pageList',
            {
                ...this.state.queryParam
            }
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    roles: res.data
                })
            }
        })
    }

    allocateResource = async () => {
        await request.post(
            '/sys/roleResource/allocate',
            {
                roleId: this.state.theIdOfUpdate,
                resourceIds: this.state.allocateResourceIds
            }
        ).then((res) => {
            if (res.code === 0) {
                this.loadDataToTable();
                this.clearAllocateModalForm();
            }
        }).catch((e) => {});
    }

    componentDidMount() {
        request.post(
            '/sys/roleResource/resources'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    resources: res.data
                })
            }
        }).catch((e) => {});

        this.loadDataToTable();
    }

    render() {
        return (
            <PageContainer>
                <ProTable
                    headerTitle="角色管理"
                    columns={this.columns}
                    dataSource={this.state.roles}
                    pagination={false}
                    rowKey={'id'}
                    // search={{
                    //     labelWidth: 'auto',
                    //     optionRender: ({ searchText, resetText }, { form }) => {
                    //         return [
                    //             <Button
                    //                 key='searchText'
                    //                 type="primary"
                    //                 onClick={() => {
                    //                     form?.submit()
                    //                 }}
                    //             >
                    //                 { searchText }
                    //             </Button>,
                    //             <Button
                    //                 key='resetText'
                    //                 onClick={() => {
                    //                     form?.resetFields();
                    //                     new Promise((resolve) => {
                    //                         resolve(
                    //                             this.setQueryParam({})
                    //                         )
                    //                     }).then(() => {
                    //                         this.loadDataToTable();
                    //                     })
                    //                 }}
                    //             >
                    //                 { resetText }
                    //             </Button>
                    //         ]
                    //     }
                    // }}
                    search={false}
                    toolBarRender={() => [
                        <Button
                            key="addRoleBtn"
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
                    onSubmit={ async (values: any) => {
                        // TODO
                    }}
                    onReset={() => {
                        // TODO
                    }}
                />

                {/* 编辑角色基本信息 */}
                <ModalForm
                    formRef={this.formRef}
                    title={this.state.modalTitle}
                    width='520px'
                    visible={this.state.showVisible}
                    onVisibleChange={(showOrNot) => {
                        if (!showOrNot) {
                            this.clearModalForm()
                        }
                    }}
                    onFinish={async (values: any) => {
                        await this.updateRole(values);
                    }}
                >
                    <Form.Item
                        name="name"
                        label="名称"
                        required
                        rules={[
                            {
                                required: true,
                                message: '角色名称不能为空'
                            }
                        ]}
                    >
                        <Input placeholder="角色名称" />
                    </Form.Item>
                </ModalForm>

                {/* 修改角色权限信息 */}
                <ModalForm
                    title="分配资源"
                    width="520px"
                    visible={this.state.allocateVisible}
                    onVisibleChange={async (showOrNot) => {
                        if (!showOrNot) {
                            await this.clearAllocateModalForm();
                        }
                    }}
                    onFinish={async () => {
                        await this.allocateResource();
                    }}
                >
                    <Tree
                        checkable
                        // defaultCheckedKeys={this.state.checkResourceIds}
                        checkedKeys={this.state.checkResourceIds}
                        onCheck={(checkedKeys: any) => {
                            this.setState({
                                allocateResourceIds: checkedKeys,
                                checkResourceIds: checkedKeys
                            })
                        }}
                        treeData={this.state.resources}
                    />
                </ModalForm>
            </PageContainer>
        )
    }
}