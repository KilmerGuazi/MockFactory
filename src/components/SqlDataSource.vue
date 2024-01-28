<script setup>
import {inject,ref,onMounted,reactive,h} from 'vue'
import { ElMessageBox,ElLoading,ElDrawer,ElMessage} from 'element-plus'
import {datasourceType,alterMsg} from '../common/common.js'
import axios from '../http/axios'

const isDrawerOpen = inject('sqlDrawerOpen', false) // 父页面传递的数据，抽屉是否打开
const currrentEditDataSourceId = inject('currrentEditDataSourceId',0) // 父页面传递的数据，当前工人id
const currentEditDataSourceType = inject('currentEditDataSourceType',1)// 父页面传递的数据，当前工人类型
const projects = inject('projects',[])// 父页面传递的数据，所有项目信息
const isCreateDataSource = inject('isCreateDataSource',false) // 父页面传递的数据，是否是创建工人
const currentEditDataSource = inject('currentEditDataSource')// 父页面传递的编辑当前数据源的数据
const dataSourceListRefresh = inject('dataSourceListRefresh')

const drawer = ref(null)
const drawerTitle = ref('新建') // 抽屉标题
const dataSourceNameInputDisabled = ref(true) // 名称是否可编辑
const dataSourceProjectInputDisabled = ref(true) // 项目是否可编辑
const dataSourceTypeInputDisabled = ref(false) // 类型是否可编辑

const form = ref(null)

// 新建数据源表单结构
const dataSource = reactive({
	id:'',
	name:'',
	type:'',
	project:{},
	ext_info:{},
	creator:localStorage.getItem('user.name')
})

// 关闭抽屉并清空表单
const closeDrawer = () => {
	datasourceCreateDrawer.value.close()
	createForm.value.resetFields()
}

// 关闭抽屉时触发的提醒
const handeleDrawerClose = (done = () => void(null)) => {
	ElMessageBox.confirm('确认关闭吗')
	  .then(() => {
		// 关闭drawer
		done()
	  })
	  .catch(() => {
		// 不处理
	    console.log('no')
	  })
}

// 保存数据源
const save = () => {
	form['value'].validate(async(valid)=>{
		if(valid){
			// 发起保存
			await axios.post('/mock/datasource/save',dataSource).then(res=>{
				if(res.status === 200 && res.data.status === 10000){
					// 关闭抽屉并提示
					cancel()
					alterMsg(res.data.msg,0)
					// 刷新数据源列表
					dataSourceListRefresh()
				}else{
					alterMsg(res.data.msg,-1)
				}
			})
		}
	})
}

// 保存取消
const cancel = () => {
	drawer.value.close()
	form.value.resetFields()
}

// 测试数据源
const test = () => {
	form['value'].validate(async(valid)=>{
		if(valid){
			// 显示遮罩
			const testLoading = ElLoading.service({
			    lock: true,
			    text: '正在测试',
			    background: 'rgba(0, 0, 0, 0.5)',
			})
			// 发起测试
			await axios.post('/mock/datasource/test',dataSource).then(res=>{
				console.log(res)
				// 关闭遮罩
				testLoading.close()
				if(res.status === 200 && res.data.status === 10000){
					ElMessageBox.alert(res.data.msg,'消息提示',{
						type:'success'
					})
				}else{
					ElMessageBox.alert(res.data.msg,'消息提示',{
						type:'error'
					})
				}
			})
		}
	})
}

// 抽屉打开事件
const drawerOpen = () =>{
	if(isCreateDataSource.value){
		// 新建
		drawerTitle.value = '新建数据源'
		dataSourceNameInputDisabled.value = false
		dataSourceProjectInputDisabled.value = false
		dataSourceTypeInputDisabled.value = true
		dataSource.id = ''
		dataSource.name = ''
		dataSource.type = currentEditDataSourceType.value
		dataSource.project = {}
		dataSource.ext_info = {}
	}else{
		// 编辑
		drawerTitle.value = '编辑数据源'
		dataSourceNameInputDisabled.value = true
		dataSourceProjectInputDisabled.value = true
		dataSourceTypeInputDisabled.value = true
		dataSource.id = currentEditDataSource.value.id
		dataSource.name = currentEditDataSource.value.name
		dataSource.type = currentEditDataSource.value.type
		dataSource.project = currentEditDataSource.value.project
		dataSource.ext_info = JSON.parse(currentEditDataSource.value.ext_info) // 字符串转成结构
	}
}

// 抽屉打开完毕
const drawerOpened = () =>{
	
}

// 新建数据源表单验证规则
const rules = reactive({
	name:[
		{
			required:true,
			message:'请输入数据源名称',
			trigger: 'blur'
		}
	],
	type:[
		{
			required:true,
			message:'请设置类型',
			trigger: 'blur'
		}
	],
	host:[
		{
			required:true,
			message:'请输入数据源host',
			trigger: 'blur'
		}
	],
	port:[
		{
			required:true,
			message:'请输入数据源port',
			trigger: 'blur'
		}
	],
	user:[
		{
			required:true,
			message:'请输入数据源user',
			trigger: 'blur'
		}
	],
	password:[
		{
			required:true,
			message:'请输入数据源密码',
			trigger: 'blur'
		}
	],
	projectId:[
		{
			required:true,
			message:'请选择项目',
			trigger: 'blur'
		}
	],
	topic:[
		{
			required:true,
			message:'请选择消息主题',
			trigger: 'blur'
		}
	]
})


</script>

<template>
	<el-drawer ref="drawer" v-model="isDrawerOpen"  :title="drawerTitle" :destroy-on-close = "true" @open="drawerOpen" @opened="drawerOpened" size="50%">
		<el-main>
			<el-form ref='form' :model="dataSource" label-position="top" label-width="100px">
				<el-form-item prop="name" label="名称" :rules="rules.name">
					<el-input v-model="dataSource.name" :disabled="dataSourceNameInputDisabled"/>
				</el-form-item>
				<el-form-item prop="project.projectId" label="项目" :rules="rules.projectId">
					<el-select v-model="dataSource.project.projectId" filterable :multiple="false" placeholder="请选择一个项目"
								clearable 
								@change="projectChange" 
								@clear="projectClear"
								:disabled="dataSourceProjectInputDisabled"
								style="width: 100%;">
					  <el-option
					    v-for="tmp in projects"
					    :key="tmp.name"
					    :label="tmp.name"
					    :value="tmp.id"
					  >
					  </el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="type" label="类型" :rules="rules.type">
					<el-select v-model="dataSource.type" filterable :multiple="false" placeholder="请选择类型"
								clearable 
								:disabled="dataSourceTypeInputDisabled"
								style="width: 100%;">
						<el-option
							v-for="tmp in datasourceType"
							:key="tmp.name"
							:label="tmp.name"
							:value="tmp.value"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="ext_info.host" label="host" :rules="rules.host">
					<el-input v-model="dataSource.ext_info.host"/>
				</el-form-item>
				<el-form-item prop="ext_info.port" label="port" :rules="rules.port">
					<el-input v-model="dataSource.ext_info.port"/>
				</el-form-item>
				<el-form-item prop="ext_info.user" label="用户" :rules="rules.user">
					<el-input v-model="dataSource.ext_info.user"/>
				</el-form-item>
				<el-form-item prop="ext_info.password" label="密码" :rules="rules.password">
					<el-input v-model="dataSource.ext_info.password"/>
				</el-form-item>
			</el-form>
		</el-main>
		<el-footer style="margin-top: 10px;">
			<el-button type="info" v-loading.fullscreen.lock="testFullLoading" @click="test">测试连接</el-button>
			<el-button type="primary" @click="save">保存</el-button>
			<el-button type="primary" @click="cancel">取消</el-button>
		</el-footer>
	</el-drawer>
</template>

<style>
</style>
