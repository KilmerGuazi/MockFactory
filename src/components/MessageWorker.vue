<script setup>
import {ref,onMounted,reactive,h,inject} from 'vue'
import {queryAllProject,queryAllMsgTemplate,queryAllDataSource} from '../http/commonRequest.js'
import {alterMsg,alterConfirmBox} from '../common/common.js'	
import {getDataSourceType} from '../common/common.js'
import axios from '../http/axios'

const isDrawerOpen = inject('messageDrawerOpen', false) // 父页面传递的数据，抽屉是否打开
const currentWorkerId = inject('workerId',0) // 父页面传递的数据，当前工人id
const currentWorkerType = inject('workerType')// 父页面传递的数据，当前工人类型
const isCreateWorker = inject('isCreateWorker',false) // 父页面传递的数据，是否是创建工人
const workerListRefresh = inject('workerListRefresh') // 父页面传递的函数，查询工人，用户保存工人刷新父页面的列表
const projects = inject('projects',[])// 父页面传递的数据，所有项目信息

const nameDisabled = ref(false)
const projectDisabled = ref(false)
const datasourceDisabled = ref(false)

const drawer = ref(null)
const templates= ref([])
const datasources=ref([])
const messageWorkerForm = ref(null)
const worker = ref({
	id:'',
	name:'',
	project:{},
	datasource:{},
	content:[],
	creator:localStorage.getItem('user.name')
})

// 抽屉打开时的事件
const drawerOpen = () =>{
	if(isCreateWorker.value){
		// 新建
		nameDisabled.value = false
		projectDisabled.value = false
		datasourceDisabled.value = false
	}else{
		// 编辑
		nameDisabled.value = false
		projectDisabled.value = true
		datasourceDisabled.value = true
		// 查询当前工人的信息
		axios.post('/mock/worker/detail/query',{id:currentWorkerId.value,type:currentWorkerType.value}).then(res=>{
			if(res.status === 200 && res.data.status === 10000){
				worker.value = res.data.data
				console.log('worker',worker.value)
			}else{
				alterMsg('查询工人明细失败',-1)
			}
		})
	}
	// 查询所有消息模板
	queryAllMsgTemplate(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			templates.value = res.data.data
		}
	})
	// 查询所有消息相关的数据源
	queryAllDataSource(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			datasources.value = res.data.data
		}
	})
}


// 抽屉打开完成事件
const drawerOpened = () =>{
	
}

// 自定义校验消息次数
const validateTemplatesCount = (rule, value, callback) => {
	if ((Math.floor(value.count) != value.count || Math.floor(value.count) <=0)){
		callback(new Error('请设置正整数的消息发送次数'))
	}else{
		callback()
	}
}

// 自定义校验消息顺序和消息id
const validateTemplatesId = (rule, value, callback) => {
	if (value===undefined ||value.order === '' || value.order === undefined || value.template.id === '' || value.template.id === undefined ){
		callback(new Error('请设置消息模板'))
	}else{
		callback()
	}
}

const rules = reactive({
	name:[
		{
			required:true,
			message:'请设置工人名称!',
			trigger: 'blur'
		}
	],
	projectId:[
		{
			required:true,
			message:'请设置项目!',
			trigger: 'blur'
		}
	],
	dataSourceId:[
		{
			required:true,
			message:'请设置数据源!',
			trigger: 'blur'
		}
	],
	templatesId:[{
		validator: validateTemplatesId, trigger: 'blur'
	}],
	templatesCount:[{
		validator: validateTemplatesCount, trigger: 'blur'
	}]
})

// 新增消息模板
const addTemplate = () =>{
	let template = {
		order:worker.value.content.length + 1,
		count:1,
		template:{
			id:'',
			name:''
		}
	}
	worker.value.content.push(template)
}

// 删除消息模板
const deleteTemplate = (scope,index,id) => {
	// 删除消息模板
	worker.value.content.splice(index,1)
	// 重新排序
	worker.value.content.forEach((template,index)=>{
		template.order = index + 1
	}) 
	worker.value.content.sort((a,b)=>{
		return a.order - b.order
	})
}

// 取消
const cancel = () =>{
	messageWorkerForm.value.resetFields()
	drawer.value.close()
	// 清除已有数据
	worker.value.id = ''
	worker.value.name = ''
	worker.value.project = {}
	worker.value.datasource = {}
	worker.value.content = []
}

// 保存
const save = ()=> {
	messageWorkerForm.value.validate(async(valid)=>{
		if(valid){
			await axios.post('/mock/worker/message/save',worker.value).then(res=>{
				if(res.status === 200 && res.data.status === 10000){
					cancel()
					workerListRefresh()
					alterMsg(res.data.msg,0)
				}else{
					alterMsg(res.data.msg,-1)
				}
			})
		}
	})
}	
</script>

<template>
	<el-drawer ref="drawer" v-model="isDrawerOpen" title="编辑工人" :direction="direction" :before-close="editDrawerClosed" :destroy-on-close = "true" @open="drawerOpen" @opened="drawerOpened" size="50%">
		<el-container style="width: 100%;height: 100%;">
			<el-main>
				<el-form ref='messageWorkerForm' :model="worker" label-position="top" label-width="100px" style="height: 100%;" :rules="rules">
					<!-- 名称 -->
					<el-form-item prop='name' label="名称" :rules="rules.name">
						<el-input v-model="worker.name" :disabled="nameDisabled"></el-input>
					</el-form-item>
					<!-- 项目 -->
					<el-form-item prop='project.id' label="项目" :rules="rules.projectId">
						<el-select v-model="worker.project.id" filterable :multiple="false" style="width: 100%;" :disabled="projectDisabled">
						  <el-option
							v-for="tmp in projects"
							:key="tmp.name"
							:label="tmp.name"
							:value="tmp.id"
						  >
						  </el-option>
						</el-select>
					</el-form-item>
					<!--数据源-->
					<el-form-item prop='datasource.id' label="数据源" :rules="rules.projectId">
						<el-select v-model="worker.datasource.id" filterable :multiple="false" style="width: 100%;" :disabled="datasourceDisabled">
						  <el-option
							v-for="tmp in datasources"
							:key="tmp.name"
							:label="tmp.name"
							:value="tmp.id"
						  >
						  <span style="float: left">{{ tmp.name }}</span>
						  <span style="float: right;color: var(--el-text-color-secondary);font-size: 13px;">{{ getDataSourceType(tmp.type) }}</span>
						  </el-option>
						</el-select>
					</el-form-item>
					<!--消息列表-->
					<el-table :data="worker.content" style="width: 100%;">
						<el-table-column label="序号" align="center">
							<template #default="{row,$index}">
								<span>{{ row.order }}</span>
							</template>
						</el-table-column>
						<el-table-column label="消息" align="center">
							<template #default="{row,$index}">
								<el-form-item :prop="`content.${$index}`" :rules="rules.templatesId">
									<el-select v-model="row.template.id" filterable :multiple="false" style="width: 100%;">
										<el-option
										v-for="tmp in templates"
										:key="tmp.name"
										:label="tmp.name"
										:value="tmp.id"
										>
										</el-option>
									</el-select>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column label="次数" align="center">
							<template #default="{row,$index}">
								<el-form-item :prop="`content.${$index}`" :rules="rules.templatesCount">
									<el-input-number v-model="row.count" :step="1" step-strictly min=1 max=101 style="width: 400px;">
										
									</el-input-number>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column prop="operation" label="操作" align="center">
							<template #default="scope">
								<el-button type="text" size="small" @click="deleteTemplate(scope,scope.$index,scope.row.id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
					<el-button type="primary"  @click="addTemplate()" style="margin-top: 20px;">新增</el-button>
				</el-form>
			</el-main>
			<el-footer>
				<el-button type="primary" @click="save">提交</el-button>
			</el-footer>
		</el-container>
	</el-drawer>
</template>

<style>
</style>
