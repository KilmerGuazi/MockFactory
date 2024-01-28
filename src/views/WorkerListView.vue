<script setup>
import {ref,onMounted,reactive,h,provide,readonly} from 'vue'
import {datasourceType,pageSize,transferVariableIdsStr2Int,commonTableRowStyle} from '../common/common.js'
import {queryAllProject,queryAllWorker,queryAllDataSource,queryAllVariables,queryAllUser} from '../http/commonRequest.js'
import { ElMessageBox,ElMessage,ElNotification} from 'element-plus'
import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
import MessageWorker from '../components/MessageWorker.vue'
import SqlWorker from '../components/SqlWorker.vue'
import {sql} from "@codemirror/lang-sql"
import axios from '../http/axios'

const loading = ref(true)
// 子页面传递数据
const sqlDrawerOpen = ref(false)
const messageDrawerOpen = ref(false)
const currrentEditWorkerId = ref(0)
const currentEditWorkerType = ref(1)
const isCreateWorker = ref(false)
provide('sqlDrawerOpen', sqlDrawerOpen)
provide('messageDrawerOpen',messageDrawerOpen)
provide('workerId',readonly(currrentEditWorkerId))
provide('workerType',readonly(currentEditWorkerType))
provide('isCreateWorker',readonly(isCreateWorker))

const createPopoverVisible = ref(false)
const createWorkerType= ref(0)
const currentPage = ref(1)
const total = ref(0)
const queryWorkerData = reactive({
	name:'',
	type:'',
	project_id:'',
	creator:''
})
const allWorkerData = ref([])
const projects = ref([]) 
provide('projects',projects)
const allUser = ref([])

// 分页发生改变
const currentPageChange = () =>{
	loading.value = true
	queryAllWorker(pageSize.value,currentPage.value,queryWorkerData,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			allWorkerData.value = res.data.data
			total.value = res.data.total
		}else{
			console.log('查询工人失败')
		}
		loading.value = false
	})
}

// 条件查询
const queryByCondition = () =>{
	loading.value = true
	queryAllWorker(pageSize.value,currentPage.value,queryWorkerData,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			allWorkerData.value = res.data.data
			total.value = res.data.total
		}else{
			console.log('查询工人失败')
		}
		loading.value = false
	})
}
// 提供给子页面使用
provide('workerListRefresh',queryByCondition)

// 新建工人,根据不同的类型区分
const createWorker=() =>{
	drawerOpen.value = true
}

const deleteWorker = (id) =>{
	axios.post('/mock/worker/delete',{id:id}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			queryAllWorker(pageSize.value,currentPage.value,queryWorkerData,(res)=>{
				if(res.status === 200 && res.data.status === 10000){
					allWorkerData.value = res.data.data
					total.value = res.data.total
				}else{
					console.log('查询工人失败')
				}
			})
		}else{
			ElMessage({
			    message: res.data.msg,
			    type: 'error',
			})
		}
	})
}

const editWorker = (worker) =>{
	currentEditWorkerType.value = worker.type
	currrentEditWorkerId.value = worker.worker_id
	isCreateWorker.value = false
	if ([1].includes(currentEditWorkerType.value)){
		sqlDrawerOpen.value = true
	}else if([4,5].includes(currentEditWorkerType.value)){
		messageDrawerOpen.value = true
	}
}

// 新建选择类型确认事件
const createPopoverConfirm=() =>{
	createPopoverVisible.value = false
	currentEditWorkerType.value = createWorkerType.value
	if([1].includes(currentEditWorkerType.value)){
		sqlDrawerOpen.value = true
	}else if([4,5].includes(currentEditWorkerType.value)){
		messageDrawerOpen.value = true
	}
	isCreateWorker.value = true
}

// 新建选择类型取消事件
const createPopoverCancel=()=>{
	createPopoverVisible.value = false
	createWorkerType.value = 0
}

onMounted(()=>{

	// 查询所有项目
	queryAllProject(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			projects.value = res.data.data
		}
	})

	// 查询所有用户
	queryAllUser((res)=>{
		allUser.value = res.data.data
	})
	
	// 查询第一页的工人
	queryAllWorker(pageSize.value,1,{},(res)=>{
		loading.value = true
		if(res.status === 200 && res.data.status === 10000){
			allWorkerData.value = res.data.data
			total.value = res.data.total
		}else{
			ElMessage({
			    message: res.data.msg,
			    type: 'error',
			})
		}
		loading.value = false
	})
})

</script>

<template>
	<!--造数工人管理页面 -->
	<el-container style="height: 100%;width: 100%;">
		<!--查询-->
		<el-header>
			<el-form :inline="true" :model="queryWorkerData" >
				<el-form-item label="工人名称">
				  <el-input v-model="queryWorkerData.name" clearable=""></el-input>
				</el-form-item>
				<el-form-item label="工人类型">
				  <el-select v-model="queryWorkerData.type" filterable :multiple="false" clearable>
				    <el-option
				      v-for="tmp in datasourceType"
				      :key="tmp.name"
				      :label="tmp.name"
				      :value="tmp.value"
				    >
				    </el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="项目">
				  <el-select v-model="queryWorkerData.project_id" filterable :multiple="false" clearable>
				    <el-option
				      v-for="tmp in projects"
				      :key="tmp.name"
				      :label="tmp.name"
				      :value="tmp.id"
				    >
				    </el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="创建人">
				  <el-select v-model="queryWorkerData.creator" filterable :multiple="false" clearable>
				    <el-option
				      v-for="tmp in allUser"
				      :key="tmp.id"
				      :label="tmp.name"
				      :value="tmp.name"
				    >
				    </el-option>
				  </el-select>
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
						<el-radio-group v-model="createWorkerType">
							<el-radio v-for="tmp in datasourceType" :label="tmp.value">
							{{tmp.name}}
							</el-radio>
						</el-radio-group>
						<template #reference>
						  <el-button type="primary" @click="createPopoverVisible = true">新建</el-button>
						</template>
						</el-popover>
				<!-- 	<el-button type="primary" @click="createWorker">新建</el-button> -->
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="allWorkerData" :row-style="commonTableRowStyle" :header-cell-style="{background:'#f0f4ff'}" style="width: 100%;" v-loading="loading" stripe border>
				<el-table-column prop="worker_id" label="id" align="center" width="100"></el-table-column>
				<el-table-column prop="worker_name" label="工人" align="left" show-overflow-tooltip="true" width="500"></el-table-column>
				<el-table-column label="项目" align="center" width="100">
					<template #default="{row}">
						<el-tag type="success">{{row.project.project_name}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="类型" align="center" width="100">
					<template #default="{row}">
						<el-tag v-if="row.type === 1" type="success">MYSQL</el-tag>
						<el-tag v-else-if="row.type === 2" type="success">CLICKHOUSE</el-tag>
						<el-tag v-else-if="row.type === 3" type="success">REDIS</el-tag>
						<el-tag v-else-if="row.type === 4" type="success">KAFKA</el-tag>
						<el-tag v-else-if="row.type === 5" type="success">MQ</el-tag>
						<el-tag v-else-if="row.type === 6" type="success">INTERFACE</el-tag>
						<el-tag v-else type="success">未知</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="creator" label="创建人" align="center"></el-table-column>
				<el-table-column prop="create_time" label="创建时间" align="center"></el-table-column>
				<el-table-column prop="operation" label="操作" align="center">
					<template #default="scope">
						<el-popconfirm title="你确认要删除此工人吗?" confirmButtonText='确认' cancelButtonText='取消' @confirm="deleteWorker(scope.row.worker_id)">
							<template #reference>
								<el-button type="text" size="small">删除</el-button>
							</template>
						</el-popconfirm>
						<el-button type="text" size="small" @click="editWorker(scope.row)">编辑</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-row style="margin-top: 20px;">
				<el-col :span="6" :offset="18" style="display: flex;align-items: center;">
					<el-pagination ref='pagination' layout="prev, pager, next" v-model:currentPage="currentPage" :page-size="pageSize" :total="total" @current-change="currentPageChange"></el-pagination>
				</el-col>
			</el-row>
		</el-main>
		<el-footer>
		</el-footer>
		<!-- 编辑工人的抽屉-->
		<!-- SQL工人子页面-->
		<SqlWorker></SqlWorker>
		<!-- 消息工人子页面-->
		<MessageWorker></MessageWorker>
	</el-container>
</template>

<style>
</style>
