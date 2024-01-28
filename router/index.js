import {createRouter, createWebHistory} from 'vue-router';

const routes = [
	{
	    path: '/Login',
	    component: () =>
	        import ("@/views/LoginView"),
	    meta: {title: "登录"}
	},
	{
		// 首页路由
		path:"/Home",
		component: () => import("@/views/HomeView"),
		name:"Home",
		meta:{title:"首页"},
		// 首页子路由，意味对应component的template中需要包含<<router-view>>
		children:[
			{
				path:"ProjectList",
				component: () => import("@/views/ProjectListView"),
				name:"ProjectList",
				meta:{title:"项目列表"}
			},
			{
				path:"UserInfo",
				component: () => import("@/views/UserInfoView"),
				name:"UserInfo",
				meta:{title:"用户信息"}
			},
			{
				path:"DataSourceList",
				component: () => import("@/views/DataSourceView"),
				name:"DataSourceList",
				meta:{title:"数据源列表"}
			},
			{
				path:"VariableList",
				component: () => import("@/views/VariableListView"),
				name:"VariableList",
				meta:{title:"变量管理"}
			},
			{
				path:"DataTemplateList",
				component:() => import("@/views/DataTemplateListView"),
				name:"DataTemplateList",
				meta:{title:"数据模板"}
			},
			{
				path:"MessageTemplateList",
				component:() => import("@/views/TemplateListView"),
				name:"MessageTemplateList",
				meta:{title:"消息模板"}
			},
			{
				path:"WorkerList",
				component: () => import("@/views/WorkerListView"),
				name:"WorkerList",
				meta:{title:"工人管理"}
			},
			// {
			// 	path:"MakeWorker",
			// 	component: () => import("@/views/MakeWorkerView"),
			// 	name:"MakeWorker",
			// 	meta:{title:"创建工人"}
			// },
			{
				path:"ProductLineList",
				component:() => import("@/views/ProductLineListView"),
				name:"ProductLineList",
				meta:{title:"生产线管理"}
			},
			{
				path:"LaunchJobList",
				component:() => import("@/views/LaunchJobView"),
				name:"LaunchJobList",
				meta:{title:"任务管理"}
			}
		]
	}
];

export default createRouter({
    history: createWebHistory(),
    routes,
})
