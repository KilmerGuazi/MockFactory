<script setup>
import {ref,reactive,onMounted,provide,readonly} from 'vue'
import { toRaw } from '@vue/reactivity'
import { ElMessageBox,ElLoading,ElDrawer,ElMessage} from 'element-plus'
import axios from '../http/axios'
import {queryAllProject} from '../http/commonRequest.js'
import {datasourceType,alterMsg} from '../common/common.js'
import SqlDataSource from '../components/SqlDataSource.vue'
import KafkaDataSource from '../components/KafkaDataSource.vue'
import MqDataSource from '../components/MqDataSource.vue'

// 子页面传递数据
const sqlDrawerOpen = ref(false)
const kafkaDrawerOpen = ref(false)
const mqDrawerOpen = ref(false)
const currrentEditDataSourceId = ref(0)
const currentEditDataSourceType = ref(1)
const isCreateDataSource = ref(false)
const currentEditDataSource = ref(null)
provide('sqlDrawerOpen', sqlDrawerOpen)
provide('kafkaDrawerOpen',kafkaDrawerOpen)
provide('mqDrawerOpen',mqDrawerOpen)
provide('currrentEditDataSourceId',readonly(currrentEditDataSourceId))
provide('currentEditDataSourceType',readonly(currentEditDataSourceType))
provide('currentEditDataSource',readonly(currentEditDataSource))
provide('isCreateDataSource',readonly(isCreateDataSource))

// 创建数据源弹出框
const createPopoverVisible = ref(false)
const createDataSourceType = ref(0)

// 新建数据源抽屉
const drawer = ref(false)
const direction = ref('rtl')
const drawerTitle = ref('新建数据源')
const datasourceCreateDrawer = ref(null)
const createForm = ref(null)
const testFullLoading = ref(false)
const dataSourceData = ref([])
const pagination = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
let projects = ref([])
provide('projects',readonly(projects))
let dataSourceNameInputDisabled = ref(false)
let dataSourceProjectInputDisabled = ref(false)
let dataSourceTypeInputDisabled = ref(false)

// 查询数据源表单结构
const queryForm = reactive({
  name: '',
  host: '',
})

// 查询数据源
const query = (pageSize,currentPage) =>{
	axios.post('/mock/datasource/query',{pageSize:pageSize,currentPage:currentPage,condition:queryForm}).then(res =>{
		if(res.status === 200 && res.data.status === 10000){
			dataSourceData.value = res.data.data
			total.value = res.data.total
			alterMsg(res.data.msg,0)
		}else{
			alterMsg(res.data.msg,-1)
		}
	})
}

// 条件查询数据源
const queryByCondition = () =>{
	query(pageSize.value,currentPage.value)
}
provide('dataSourceListRefresh',queryByCondition)

// 禁用数据源
const disableDataSource = (id,disable) =>{
	axios.post('/mock/datasource/disable',{id:id,disable:disable}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			alterMsg(res.data.msg,0)
			queryByCondition()
		}else{
			alterMsg(res.data.msg,-1)
		}
	})
}

// 删除数据源
const deleteDataSource = (id) =>{
	axios.post('/mock/datasource/delete',{id:id}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			alterMsg(res.data.msg,0)
			queryByCondition()
		}else{
			alterMsg(res.data.msg,-1)
		}
	})
}


// 新建选择类型确认事件
const createPopoverConfirm=() =>{
	createPopoverVisible.value = false
	currentEditDataSourceType.value = createDataSourceType.value
	if([1].includes(currentEditDataSourceType.value)){
		sqlDrawerOpen.value = true
	}else if([4].includes(currentEditDataSourceType.value)){
		kafkaDrawerOpen.value = true
	}else if([5].includes(currentEditDataSourceType.value)){
		mqDrawerOpen.value = true
	}
	isCreateDataSource.value = true
}

// 新建选择类型取消事件
const createPopoverCancel=()=>{
	createPopoverVisible.value = false
	createWorkerType.value = 0
}

// 编辑数据源
const editDataSource = (data) =>{
	isCreateDataSource.value = false
	currentEditDataSource.value = data
	currentEditDataSourceType.value = data.type
	if([1].includes(currentEditDataSourceType.value)){
		sqlDrawerOpen.value = true
	}else if([4].includes(currentEditDataSourceType.value)){
		kafkaDrawerOpen.value = true
	}else if([5].includes(currentEditDataSourceType.value)){
		mqDrawerOpen.value = true
	}
	
}

// 分页
const handleCurrentChange = (val) => {
  query(pageSize.value,currentPage.value)
}

onMounted(() => {
	// 查询数据源
	query(pageSize.value,currentPage.value)
	// 查询所有可用项目
	queryAllProject(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			projects.value = res.data.data
		}
	})
})
</script>

<template>
	<el-container style="width: 100%;height: 100%;">
		<el-header>
			<el-form :inline="true" :model="queryForm" >
			    <el-form-item label="名称">
			      <el-input v-model="queryForm.name" clearable=""></el-input>
			    </el-form-item>
			    <el-form-item label="Host">
			      <el-input v-model="queryForm.host" clearable=""></el-input>
			    </el-form-item>
			    <el-form-item>
			      <el-button type="primary" @click="queryByCondition">查询</el-button>
				  <!--新建工人前需要选择工人类型-->
					<el-popover v-model:visible="createPopoverVisible" placement="bottom" :width="160">
						<p>请选择你要创建的类型</p>
						<div style="text-align: right; margin: 0">
						  <el-button size="small" type="text" @click="createPopoverCancel">取消</el-button>
						  <el-button size="small" type="primary" @click="createPopoverConfirm">确认</el-button>
						</div>
						<el-radio-group v-model="createDataSourceType">
							<el-radio 
							v-for="tmp in datasourceType"
							:label="tmp.value">
							{{tmp.name}}
							</el-radio>
						</el-radio-group>
						<template #reference>
						  <el-button type="primary" @click="createPopoverVisible = true">新建</el-button>
						</template>
					</el-popover>
			    </el-form-item>
			</el-form>
		</el-header>
		<!--列表-->
		<el-main>
			<el-table :data="dataSourceData" style="width: 100%;">
				<el-table-column prop="id" label="id" align="center"></el-table-column>
				<el-table-column prop="name" label="数据源名称" align="center"></el-table-column>
				<el-table-column label="项目名称" align="center">
					<template #default="{row,$index}">
						<el-tag type="success">{{row.project.projectName}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="type" label="类型" align="center">
					<template #default="scope">
						<el-tag v-if="scope.row.type === 1" type="success">MYSQL</el-tag>
						<el-tag v-else-if="scope.row.type === 2" type="success">CLICKHOUSE</el-tag>
						<el-tag v-else-if="scope.row.type === 3" type="success">REDIS</el-tag>
						<el-tag v-else-if="scope.row.type === 4" type="success">KAFKA</el-tag>
						<el-tag v-else-if="scope.row.type === 5" type="success">MQ</el-tag>
						<el-tag v-else-if="scope.row.type === 6" type="success">INTERFACE</el-tag>
						<el-tag v-else type="success">未知</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="creator" label="创建人" align="center"></el-table-column>
				<el-table-column prop="create_time" label="创建时间" align="center"></el-table-column>
				<el-table-column prop="operation" label="操作" align="center" fixed="right">
					<template #default="scope">
						<el-button type="text" size="small" @click="disableDataSource(scope.row.id,scope.row.disabled)">
							<span v-if="scope.row.disabled === 0">禁用</span>
							<span v-else>启用</span>
						</el-button>
						<el-button type="text" size="small" @click="editDataSource(scope.row)">编辑</el-button>
						<el-button type="text" size="small" @click="deleteDataSource(scope.row.id)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<!--分页-->
		<el-footer>
			<el-row style="height: 100%;">
				<el-col :span="6" :offset="18" style="display: flex;align-items: center;">
					<el-pagination ref='pagination' layout="prev, pager, next" v-model:currentPage="currentPage" :page-size="pageSize" :total="total" @current-change="handleCurrentChange"></el-pagination>
				</el-col>
			</el-row>
		</el-footer>
		<!--sql数据源子页面-->
		<SqlDataSource></SqlDataSource>
		<!--kafka数据源子页面-->
		<KafkaDataSource></KafkaDataSource>
		<!--mq数据源子页面-->
		<MqDataSource></MqDataSource>
	</el-container>
</template>

<style>
	.query_text {
		font-size:15px;
		margin-left: 20px;
		font-weight:300;
	}
</style>
