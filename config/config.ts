// https://umijs.org/config/
import { defineConfig } from 'umi';
import { join } from 'path';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/user',
      layout: false,
      routes: [
        {
          path: '/user/login',
          layout: false,
          name: 'login',
          component: './user/Login',
        },
        {
          path: '/user',
          redirect: '/user/login',
        },
        {
          component: '404',
        },
      ],
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      icon: 'dashboard',
      routes: [
        {
          path: '/dashboard',
          redirect: '/dashboard/workplace',
        },
        {
          name: '工作台',
          icon: 'smile',
          path: '/dashboard/workplace',
          component: './dashboard/workplace',
        }
      ],
    },
    {
        name: '系统管理',
        path: '/sys',
        routes: [
            {
                name: '用户管理',
                path: '/sys/user',
                component: './sys/userManagement',
                access: 'canVisit'
            },
            {
                name: '角色管理',
                path: '/sys/role',
                component: './sys/role',
                access: 'canVisit'
            },
            {
                name: '权限管理',
                path: '/sys/resource',
                component: './sys/resource',
                access: 'canVisit'
            }
        ]
    },
    {
        name: '字典管理',
        path: '/dict',
        component: './dict',
        canVisit: 'canVisit'
    },
    {
        name: '城市管理',
        path: '/city',
        component: './city',
        access: 'canVisit'
    },
    {
        name: '酒店管理',
        path: '/hotel',
        routes: [
            {
                name: '酒店信息',
                path: '/hotel/hotelInfo',
                component: './hotel/HotelInfo',
                access: 'canVisit'
            },
            {
                name: '客房信息',
                path: '/hotel/hotelRoom',
                component: './hotel/RoomInfo',
                access: 'canVisit'
            }
        ]
    },
    {
        name: '商品管理',
        path: '/hotelCommodity',
        component: './commodity',
        access: 'canVisit'
    },
    {
        name: '财务',
        path: '/finance',
        routes: [
            {
                name: '订单管理',
                path: '/finance/hotelOrder',
                component: './finance/Order',
                access: 'canVisit'
            },
            {
                name: '充值',
                path: '/finance/recharge',
                component: './finance/Recharge',
                access: 'canVisit'
            },
            {
                name: '商品订单',
                path: '/finance/commodityOrder',
                component: './finance/CommodityOrder',
                access: 'canVisit'
            }
        ]
    },
    {
        name: '会员管理',
        path: '/vipUser',
        component: './vipUser',
        access: 'canVisit'
    },
    {
      path: '/',
      redirect: '/dashboard/analysis',
    },
    {
      component: '404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  openAPI: [
    {
      requestLibPath: "import { request } from 'umi'",
      // 或者使用在线的版本
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      schemaPath: join(__dirname, 'oneapi.json'),
      mock: false,
    },
    {
      requestLibPath: "import { request } from 'umi'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
  nodeModulesTransform: {
    type: 'none',
  },
  mfsu: {},
  webpack5: {},
  exportStatic: {},
  define: {
    "process.env.URL": "http://localhost:8080"
  }
});
