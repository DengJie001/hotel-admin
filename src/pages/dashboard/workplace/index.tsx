import { Avatar } from 'antd';

import { PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import React from 'react';
import { request } from '@/utils/request';
import Text from 'antd/lib/typography/Text';
import { Line, Pie } from '@ant-design/charts';

interface State {
    currentLoginUserInfo: any;
    lineData: Array<any>;
    pieData: Array<any>
}

export default class WorkPlace extends React.Component<{}, State> {
    state: State = {
        currentLoginUserInfo: {},
        lineData: [],
        pieData: []
    }

    getCurrentLoginUserInfo = async () => {
        await request.get(
            '/workspace/currentLoginUser'
        ).then((res) => {
            if (res.code === 0) {
                console.log(res);
                this.setState({
                    currentLoginUserInfo: res.data
                });
            }
        }).catch((e) => { })
    }

    componentDidMount() {
        this.getCurrentLoginUserInfo();

        // 获取折线图数据
        request.get(
            '/workspace/lineData'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    lineData: res.data
                })
            }
        }).catch((e) => {});

        // 获取饼图数据
        request.get(
            '/workspace/pieData'
        ).then((res) => {
            if (res.code === 0) {
                this.setState({
                    pieData: res.data
                })
            }
        }).catch((e) => {});
    }

    render() {
        return (
            <PageContainer
                content={
                    <div className={styles.pageHeaderContent}>
                        <div className={styles.content}>
                            <div className={styles.contentTitle}>
                                {this.state.currentLoginUserInfo.time}
                                ，
                                {this.state.currentLoginUserInfo.name}
                                ，祝你开心每一天！
                            </div>
                            <div>
                                {this.state.currentLoginUserInfo.roleName}
                            </div>
                        </div>
                    </div>
                }
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* <div style={{
                        width: '45%',
                        backgroundColor: 'white',
                        borderRadius: '10px'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            marginTop: '10px',
                            fontSize: '20px',
                            fontWeight: 'bold'
                        }}>销售数据</div>
                        <Pie 
                            // appendPadding={10}
                            data={this.state.pieData}
                            angleField={'value'}
                            colorField={'type'}
                            radius={1}
                            innerRadius={0.6}
                            label={{
                                type: 'inner',
                                offset: '-50%',
                                visible: false,
                                style: {
                                    textAlign: 'center',
                                    fontSize: 14,
                                },
                            }}
                            interactions={[
                                {
                                    type: 'element-selected',
                                },
                                {
                                    type: 'element-active',
                                },
                            ]}
                        />
                    </div> */}

                    <div
                        hidden={this.state.lineData.length === 0}
                         style={{
                        width: '45%',
                        backgroundColor: 'white',
                        borderRadius: '10px'
                    }}>
                        <div
                            style={{
                                textAlign: 'center',
                                marginTop: '10px',
                                fontSize: '20px',
                                fontWeight: 'bold'
                            }}
                        >销售曲线</div>
                        <Line
                            data={this.state.lineData}
                            padding='auto'
                            xField='date'
                            yField='value'
                        />
                    </div>
                </div>
            </PageContainer>
        )
    }
}