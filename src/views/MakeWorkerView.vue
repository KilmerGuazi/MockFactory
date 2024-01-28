<script setup>
import {ref,reactive,onMounted,watch,provide} from 'vue'
import { ElMessageBox,ElLoading,ElDrawer,ElMessage} from 'element-plus'
import axios from '../http/axios'
import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
import {CompletionContext,autocompletion} from "@codemirror/autocomplete"
import {sql} from "@codemirror/lang-sql"
import {queryAllProject,queryAllVariables,queryAllDataSource} from '../http/commonRequest'
import {transferVariable2Schema} from '../common/common.js'
import MessageWorker from '../components/MessageWorker.vue'

const sqlVariablesSchema = ref({})
let projects = ref([])
let variables = ref([])
let dataSources = ref('')
let sqlEditView = ref(EditorView)
let variablesNoDataTxt = ref('请选择项目')
let dataSourcesNoDataTxt = ref('请选择项目')
const sqlEditor = ref(null)
const dataSourceChooseItems = ref([])
const createSqlWorkerForm = ref(null)
const sqlBasicForm = reactive({
	id:'',
	name:'',
	datasource:{},
	db:'',
	project:{},
	variables:'',
	sql:'',
	creator:localStorage.getItem('user.name')
})
const dataSourceSelect = ref(null)


// 提交SQL造数工人
const submitSqlWoker = () =>{
	
	createSqlWorkerForm['value'].validate(async(valid)=>{
		if(valid){
			sqlBasicForm.sql = sqlEditView.value.state.doc.toString()
			await axios.post('/mock/worker/sql/save',sqlBasicForm).then(res=>{
				if(res.status === 200 && res.data.status === 10000){
					ElMessage({
					    message: res.data.msg,
					    type: 'success',
					})
				}else{
					ElMessage({
					    message: res.data.msg,
					    type: 'error',
					})
				}
			})
		}
	})
}

// 项目选择器发生改变
const projectChange = (currentProjectId) => {
	// 查询所有可用的变量集
	if(currentProjectId != ''){
		queryAllVariables(10000,1,{'project_id':currentProjectId},(res)=>{
			if(res.status === 200 && res.data.status === 10000){
				variables.value = res.data.data
				if (variables.value.length === 0) variablesNoDataTxt.value = '当前项目没有变量集'
			}
		})
		queryAllDataSource(10000,1,{'project_id':currentProjectId},(res)=>{
			if(res.status === 200 && res.data.status === 10000){
				dataSources.value = res.data.data
				console.log(dataSources.value)
				if (dataSources.value.length === 0) dataSourcesNoDataTxt.value = '当前项目没有数据源'
			}
		})
	}
}

// 项目选择器发生清空
const projectClear = () => {
	variables.value = []
	dataSources.value = []
	variablesNoDataTxt.value = '请选择项目'
	dataSourcesNoDataTxt.value = '请选择项目'
	createSqlWorkerForm.value.resetFields()
}

// 变量集选择器发生改变时需要重新拉取当前编辑器的变量集
const variablesChange = () => {
	axios.post('/mock/variables/queryBatch',{ids:sqlBasicForm.variables,projectId:sqlBasicForm.project.project_id}).then(res=>{
		if(res.status === 200 & res.data.status === 10000){
			let source = res.data.data
			source.forEach((v,index)=>{
				transferVariable2Schema(sqlVariablesSchema.value,v.name, JSON.parse(v.content))
			})
			console.log('schema',sqlVariablesSchema.value)
		}else{
			console.log(res.data.msg)
		}
	})
}


// 监听变量集是否发生变化，变量集发生变更时，重新加载编辑器
watch(sqlVariablesSchema.value,(sqlVariablesSchema,preSqlVariablesSchema)=>{
	console.log('变量集发生变化',sqlVariablesSchema,preSqlVariablesSchema)
	let tmpDoc = sqlEditView.value.state.doc.toString()
	createSQLEditor(tmpDoc)
})

// 自定义检验工人的项目信息
const validateProjectInfo = (rule, value, callback) => {
	if (value.project_id === undefined){
		callback(new Error('请选择项目'))
	}else{
		callback()
	}
}

// 自定义检验工人的数据源信息
const validateDataSourceInfo = (rule, value, callback) => {
	console.log(value)
	if (value.datasource_id === undefined ){
		callback(new Error('请选择数据源'))
	}else{
		callback()
	}
}

// 提交SQL造数工人校验
const rules = reactive({
	name:[
		{
			required:true,
			message:'请输入工人名称',
			trigger: 'blur'
		}
	],
	datasource:[
		{
			required:true,
			validator:validateDataSourceInfo,
			trigger: 'blur'
		}
	],
	db:[
		{
			required:true,
			message:'请输入数据库',
			trigger: 'blur'
		}
	],
	project:[
		{
			required:true,
			validator:validateProjectInfo,
			trigger: 'blur'
		}
	]
})

// 创建SQL编辑器
const createSQLEditor = (doc) => {
	if (typeof sqlEditView.value === 'object') {
		console.log('destory editor')
		sqlEditView.value.destroy()
	}
	
	// SQL输入框
	let state = EditorState.create({doc:doc,extensions:[basicSetup,EditorView.lineWrapping,sql({schema:sqlVariablesSchema.value})]});
	sqlEditView.value = new EditorView({
		state:state,
		parent:sqlEditor.value
	})
}

onMounted(()=>{
	
	// 查询所有可用数据源
	axios.post('/mock/datasource/query',{pageSize:10000,currentPage:1,condition:{disabled:0}}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			dataSourceChooseItems.value = res.data.data
		}
	})
	
	// 查询所有可用项目
	queryAllProject(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			projects.value = res.data.data
		}
	})
	
	// 创建SQL编辑器
	createSQLEditor("-- 请在这里输入SQL!")
})
</script>

<template>
	<el-tabs type="border-card" style="width: 100%;height:100%;margin-left:10px;">
	    <el-tab-pane label="SQL" style="height: 100%;">
			<el-form ref='createSqlWorkerForm' :model="sqlBasicForm" :rules="rules" style="height: 100%;">
				<el-container style="width: 100%;height: 100%;">
					<el-header>
						<el-row :gutter="30">
							<el-col :span="6">
								<el-form-item prop='name' label="名称">
								  <el-input v-model="sqlBasicForm.name"></el-input>
								</el-form-item>
							</el-col>
							<el-col :span="6">
								<el-form-item prop='datasource' label="数据源">
									<el-select ref="dataSourceSelect" v-model="sqlBasicForm.datasource.datasource_id" filterable :multiple="false" 
												placeholder="请选择一个数据源"
												clearable
												:no-data-text="dataSourcesNoDataTxt">
									  <el-option
									    v-for="tmp in dataSources"
									    :key="tmp.name"
									    :label="tmp.name"
									    :value="tmp.id"
									  >
									  </el-option>
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :span="6">
								<el-form-item prop='db' label="数据库">
								  <el-input v-model="sqlBasicForm.db"></el-input>
								</el-form-item>
							</el-col>
							<el-col :span="6">
								<el-form-item prop='project' label="项目">
									<el-select v-model="sqlBasicForm.project.project_id" filterable :multiple="false" placeholder="请选择一个项目" 
												clearable 
												@change="projectChange" 
												@clear="projectClear">
								      <el-option
								        v-for="tmp in projects"
								        :key="tmp.name"
								        :label="tmp.name"
								        :value="tmp.id"
								      >
								      </el-option>
									</el-select>
								</el-form-item>
							</el-col>
						</el-row >
						<el-row :gutter="30">
							<el-col :span="6">
								<el-form-item prop='variables' label="变量集">
								  <el-select v-model="sqlBasicForm.variables" 
												filterable multiple placeholder="请选择变量集,最多三个" 
												:no-data-text="variablesNoDataTxt"
												multiple-limit="3"
												@change="variablesChange">
								    <el-option
								      v-for="tmp in variables"
								      :key="tmp.name"
								      :label="tmp.name"
								      :value="tmp.id"
								    >
								    </el-option>
								  </el-select>
								</el-form-item>
							</el-col>
						</el-row>
					</el-header>
					<el-main style="height: 60%;margin-top: 20px;">
						<el-from-item label="SQL" style="height: 100%;">
							<div ref='sqlEditor' style="height: 100%; width: 95%;"></div>
							<!-- <el-input ref='sqlEditor' v-model="sqlBasicForm.sql" :rows="30" type="textarea" placeholder="请在这里输入sql..." maxlength="5000" show-word-limit/> -->
							<!-- <codemirror v-model="code" :options="cmOption" /> -->
						</el-from-item>
					</el-main>
					<el-footer>
						<el-button type="primary" @click="submitSqlWoker">提交</el-button>
					</el-footer>
				</el-container>
			</el-form>
		</el-tab-pane>
		<el-tab-pane label="消息">
			<MessageWorker></MessageWorker>
		</el-tab-pane>
	    <el-tab-pane label="规则">
			
		</el-tab-pane>
	    <el-tab-pane label="接口">
			
		</el-tab-pane>
		<el-tab-pane label="混合">
			
		</el-tab-pane>
	</el-tabs>
</template>



<style>
	.el-tabs__content {
		height: 90%;
	}
	.cm-scroller { 
		overflow: 
		auto; 
	}
	.cm-editor {
		height: 100%;
		width: 95%;
	}
	/* .cm-line {
		white-space: pre-wrap !important;
	} */
	.el-select {
		width: 100%;
	}
</style>
