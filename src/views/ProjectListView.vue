<script setup>
import {ref,onMounted,reactive} from 'vue'
import { Edit, Share, Delete, Search, Upload, Plus } from '@element-plus/icons-vue'
import { ElMessageBox,ElMessage } from 'element-plus'
import { ElDrawer } from 'element-plus'
import axios from '../http/axios'
import {queryAllProject} from '../http/commonRequest'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const queryProjectData = reactive({
	name:''
})

const createProjectForm = ref(null)
const createProjectData = reactive({
	id:'',
	name:'',
	creator:localStorage.getItem('user.name')
})

// 新建项目抽屉
const drawer = ref(false)
const drawerTitle = ref('')
const direction = ref('rtl')
const createProjectDrawer = ref(null)
// 项目数据
const projectData = ref([])

const rules = reactive({
	name:[
		{
			required:true,
			message:'请输入项目名称',
			trigger: 'blur'
		}
	]
})

// 关闭新建项目抽屉时触发的提醒
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

// 删除项目
const deleteProject = (projectId) => {
	axios.post('/mock/project/delete',{id:projectId}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			ElMessage({
			    message: res.data.msg,
			    type: 'success',
			})
			queryByCondition()
		}else{
			ElMessage({
			    message: res.data.msg,
			    type: 'error',
			})
		}
	})
}

// 编辑项目
const editProject = (project) => {
	createProjectData.id = project.id
	createProjectData.name = project.name
	createProjectData.creator = localStorage.getItem('user.name')
	drawerTitle.value = '编辑数据源'
	drawer.value = true
}

// 新建数据源
const createProject = () =>{
	createProjectData.id = ''
	createProjectData.name = ''
	createProjectData.creator = localStorage.getItem('user.name')
	drawerTitle.value = '新建数据源'
	drawer.value = true
}

// 禁用项目
const disableProject = (projectId,disabled) =>{
	console.log(disabled)
	axios.post('/mock/project/disable',{id:projectId,disabled:disabled}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			ElMessage({
			    message: res.data.msg,
			    type: 'success',
			})
			queryByCondition()
		}else{
			ElMessage({
			    message: res.data.msg,
			    type: 'error',
			})
		}
	})
}

// 关闭抽屉
const closeDrawer = () =>{
	createProjectDrawer.value.close()
	createProjectForm.value.resetFields()
}

// 保存项目
const save = () => {
	createProjectForm.value.validate(async(valid)=>{
		if(valid){
			await axios.post('/mock/project/add',createProjectData).then(res=>{
				if(res.status === 200 && res.data.status === 10000){
					// 关闭抽屉、清空表单
					closeDrawer()
					ElMessage({
					    message: res.data.msg,
					    type: 'success',
					})
					queryByCondition()
				}
				else{
					ElMessage({
					    message: res.data.msg,
					    type: 'error',
					})
				}
			})
		}
	})
}

// 取消保存
const cancel = () => {
	closeDrawer()
}

// 查询
const query = (pageSize,currentPage) =>{
	axios.post('/mock/project/query',{pageSize:pageSize,currentPage:currentPage,condition:queryProjectData}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			projectData.value = res.data.data
			total.value = res.data.total
		}else{
			console.log('查询数据源失败')
		}
	})
}

// 分页查询
const currentPageChange = (val) =>{
	console.log(`current page: ${val}`)
	query(pageSize.value,currentPage.value)
}

// 条件查询
const queryByCondition = () =>{
	query(pageSize.value,currentPage.value)
}

onMounted(()=>{
	// 查询所有项目
	queryAllProject(pageSize.value,currentPage.value,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			projectData.value = res.data.data
			total.value = res.data.total
		}
		else{
			ElMessage({
			    message: res.data.msg,
			    type: 'error',
			})
		}
	})
}) 


</script>

<template>
	<!-- 项目列表页面 -->
	<el-main style="height: 100%;width: 100%;">
		<!--查询-->
		<el-header>
			<!-- <el-row >
				<el-col :span="20">
					<span>项目管理</span>
					<el-input placeholder="Please input" style="width: 20%;margin-left: 20px;"/>
				</el-col>
				<el-col :span="4" style="display: flex;align-items: center;">
					<el-button type="primary" :icon="Search">查询</el-button>
					<el-button type="primary" :icon="Plus" @click="drawer = true">新建</el-button>
				</el-col>
			</el-row> -->
			<el-form :inline="true" :model="queryProjectData" >
				<el-form-item label="名称">
				  <el-input v-model="queryProjectData.name" clearable=""></el-input>
				</el-form-item>
				<el-form-item>
				  <el-button type="primary" @click="queryByCondition">查询</el-button>
				  <el-button type="primary" @click="createProject">新建</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<!--列表-->
		<el-main>
			<el-table :data="projectData" style="width: 100%;">
				<el-table-column prop="id" label="id" align="center"></el-table-column>
				<el-table-column label="项目名称" align="center">
					<template #default="{row,$index}">
						<el-tag type="success">{{row.name}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="creator" label="创建人" align="center"></el-table-column>
				<el-table-column prop="create_time" label="创建时间" align="center"></el-table-column>
				<el-table-column prop="operation" label="操作" align="center">
					<template #default="scope">
						<el-button type="text" size="small" @click="disableProject(scope.row.id,scope.row.disabled)">
							<span v-if="scope.row.disabled === 0">禁用</span>
							<span v-else>启用</span>
						</el-button>
						<el-button type="text" size="small" @click="deleteProject(scope.row.id)">删除</el-button>
						<el-button type="text" size="small" @click="editProject(scope.row)">编辑</el-button>
						
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<!--分页-->
		<el-footer>
			<el-row style="height: 100%;">
				<el-col :span="6" :offset="18" style="display: flex;align-items: center;">
					<el-pagination layout="prev, pager, next" v-model:currentPage="currentPage" :page-size="pageSize" :total="total" @current-change="currentPageChange"></el-pagination>
				</el-col>
			</el-row>
		</el-footer>
		<el-drawer ref='createProjectDrawer' v-model="drawer" :title="drawerTitle" :direction="direction" :before-close="handeleDrawerClose" size="50%">
			<el-form ref='createProjectForm' :model="createProjectData" :rules="rules" label-position="top" label-width="100px">
				<el-form-item prop="name" label="项目名称">
					<el-input v-model="createProjectData.name"/>
				</el-form-item>
				<el-button type="primary" @click="save">保存</el-button>
				<el-button type="primary" @click="cancel">取消</el-button>
			</el-form>
		</el-drawer>
	</el-main>
</template>

<style>
.el-empty {
	height: 100%;
	width: 100%;
}
</style>

