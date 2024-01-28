<script setup>
import {ref,onMounted,reactive,h} from 'vue'
import { Edit, Share, Delete, Search, Upload, Plus } from '@element-plus/icons-vue'
import { ElMessageBox,ElMessage,ElNotification} from 'element-plus'
import { ElDrawer } from 'element-plus'
import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
import {json} from "@codemirror/lang-json"
import axios from '../http/axios'
import {queryAllProject,queryAllVariables} from '../http/commonRequest'
import {variableType} from '../common/common.js'
import JsonEditor from '@/components/JsonEditor.vue'

let jsonBigint = require('json-bigint')
const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)
const drawerTitle = ref('')
const drawer = ref(false)
const createVDrawer = ref(null)
const createVForm = ref(null)
let variablesNameInputDisabled = ref(false)
let variablesProjectInputDisabled = ref(false)
let variablesTypeInputDisabled = ref(false)
const jsonEditorTitle = ref('变量内容（JSON）')
const jsonEditorTips = ref('请以json的格式编写变量内容！')
const jsonEditorDivStyle = ref({
	width:'100%',
	height:'500px'
})
const projectChooseItems = ref([])

const queryVData = reactive({
	name:''
})

const createVData = ref({
	id:'',
	name:'',
	type:'',
	project:{},
	content:null,
	creator:localStorage.getItem("user.name")
})

const createSourceData = ref({
	id:'',
	name:'',
	type:'',
	project:{},
	content:null,
	creator:localStorage.getItem("user.name")
})

const vData = ref([])

// 分页
const currentPageChange = (val) =>{
	queryAllVariables(pageSize.value,currentPage.value,queryVData,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			vData.value = res.data.data
			total.value = res.data.total
		}else{
			console.log('查询变量失败')
		}
	})
}

// 创建变量
const createV = () => {
	drawerTitle.value = '新建变量集'
	drawer.value = true
	variablesNameInputDisabled.value = false
	variablesProjectInputDisabled.value = false
	variablesTypeInputDisabled.value = false
}

// 保存变量
const saveV = () => {
	createVForm.value.validate(async(valid)=>{
		if(valid){
			axios.post('/mock/variables/save',createVData.value).then(res => {
				if(res.status === 200 && res.data.status === 10000){
					ElMessage({
						message: res.data.msg,
						type: 'success',
					})
					drawer.value = false
					queryByCondition()
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

// 编辑变量
const editV = (currentVariable) =>{
	drawer.value = true
	drawerTitle.value = '编辑变量集'
	variablesNameInputDisabled.value = true
	variablesProjectInputDisabled.value = true
	variablesTypeInputDisabled.value = true
	createVData.value = currentVariable
}

// 删除变量
const deleteV = (variablesId) =>{
	axios.post('/mock/variables/delete',{id:variablesId}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			ElMessage({
			    message: res.data.msg,
			    type: 'success',
			})
			queryByCondition()
		}
	})
}

// 取消
const cancel = () =>{
	drawer.value = false
}

/**
 * 抽屉关闭
 */
const drawserClosed = () =>{
	createVData.value = createSourceData.value
}

// 条件查询
const queryByCondition = () => {
	queryAllVariables(pageSize.value,currentPage.value,queryVData,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			vData.value = res.data.data
			total.value = res.data.total
		}else{
			console.log('查询变量失败')
		}
	})
}

const clickVariableNameInput = () => {
	 ElNotification({
	    title: '提示',
	    message: '变量名称只能包含大小写英文字符和数字!',
		type: 'info'
	  })
}

const valiableNameValidator = (rule,value,callback) =>{
	if(!/^[a-zA-z0-9]+$/.test(value) ){
		callback(new Error('变量级名称只能是英文小写字母'))
	}else{
		callback()
	}
}

/**
 * 新建、编辑保存时自定义对变量的输出内容进行校验
 */
const checkVariableContent = (rule,value,callback) =>{
	// 判断变量是不是空json
	try {
		let variable = jsonBigint.parse(value)
		if (JSON.stringify(variable) === '{}' || variable === null){
			throw new Error('变量集不应该为空')
		}
		callback()
	} catch (error) {
		callback(new Error('JSON格式异常！'))
	}

}

// 创建变量表达校验规则
const createRules = reactive({
	name:[
		{
			required:true,
			validator:valiableNameValidator,
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
	type:[
		{
			required:true,
			message:'请设置类型!',
			trigger:'blur'
		}
	],
	content:[
		{
			required:true,
			validator:checkVariableContent, 
			trigger: 'blur'
		}
	]
})

onMounted(()=>{
	// 查询所有变量
	queryAllVariables(pageSize.value,currentPage.value,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			vData.value = res.data.data
			total.value = res.data.total
		}else{
			console.log('查询变量失败')
		}
	})
	// 查询所有项目
	queryAllProject(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			projectChooseItems.value = res.data.data
		}else{
			console.log('查询项目失败')
		}
	})
})


</script>

<template>
	<!-- 变量列表页面 -->
	<el-container style="height: 100%;width: 100%;">
		<!--查询-->
		<el-header>
			<el-form :inline="true" :model="queryVData" >
				<el-form-item label="变量集名称">
				  <el-input v-model="queryVData.name" clearable=""></el-input>
				</el-form-item>
				<el-form-item>
				  <el-button type="primary" @click="queryByCondition">查询</el-button>
				  <el-button type="primary" @click="createV()">新建</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<!--列表-->
		<el-main>
			<el-table :data="vData" :row-style="commonTableRowStyle" :header-cell-style="{background:'#f0f4ff'}" style="width: 100%; " stripe border>
				<el-table-column prop="id" label="id" align="center"></el-table-column>
				<el-table-column prop="name" label="变量集名称" align="center"></el-table-column>
				<el-table-column prop="type" label="类型" align="center">
					<template #default="scope">
						<el-tag v-if="scope.row.type === 1" type="success">JSON</el-tag>
						<el-tag v-else-if="scope.row.type === 2" type="success">XML</el-tag>
						<el-tag v-else type="success">未知</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="项目名称" align="center">
					<template #default="{row,$index}">
						<el-tag type="success">{{row.project.projectName}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="creator" label="创建人" align="center"></el-table-column>
				<el-table-column prop="create_time" label="创建时间" align="center"></el-table-column>
				<el-table-column prop="operation" label="操作" align="center">
					<template #default="scope">
						<el-button type="text" size="small" @click="deleteV(scope.row.id)">删除</el-button>
						<el-button type="text" size="small" @click="editV(scope.row)">编辑</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-row style="margin-top: 20px;">
				<el-col :span="6" :offset="18" style="display: flex;align-items: center;">
					<el-pagination layout="prev, pager, next" v-model:currentPage="currentPage" :page-size="pageSize" :total="total" @current-change="currentPageChange"></el-pagination>
				</el-col>
			</el-row>
		</el-main>
		<!--分页-->
		<el-footer>
		</el-footer>
		<el-drawer ref='createVDrawer' v-model="drawer" :title="drawerTitle" :direction="direction" @closed="drawserClosed" :destroy-on-close = "true" @opened='drawerOpened' size="50%">
			<el-container>
				<el-main>
					<el-form ref="createVForm" :model="createVData" :rules="createRules" label-position="top" label-width="100px" style="height: 100%;">
						<el-form-item prop="name" label="变量名称">
							<el-input v-model="createVData.name" :disabled="variablesNameInputDisabled" @click='clickVariableNameInput'/>
						</el-form-item>
						<el-form-item prop="type" label="变量类型">
							<el-select v-model="createVData.type" filterable :multiple="false" placeholder="请选择类型"
										clearable 
										:disabled="variablesTypeInputDisabled"
										style="width: 100%;">
							  <el-option
							    v-for="tmp in variableType"
							    :key="tmp.name"
							    :label="tmp.name"
							    :value="tmp.value"
							  >
							  </el-option>
							</el-select>
						</el-form-item>
						<el-form-item prop="project.projectId" label="项目" :rules="createRules.projectId">
							<el-select v-model="createVData.project.projectId" filterable :multiple="false" placeholder="请选择一个项目"
										clearable 
										:disabled="variablesProjectInputDisabled"
										style="width: 100%;">
							  <el-option
							    v-for="tmp in projectChooseItems"
							    :key="tmp.name"
							    :label="tmp.name"
							    :value="tmp.id"
							  >
							  </el-option>
							</el-select>
						</el-form-item>
						<!-- 变量内容的JSON编辑框 -->
						<el-form-item prop="content">
							 <JsonEditor v-model:content="createVData.content" :title=jsonEditorTitle :tips=jsonEditorTips :divStyle=jsonEditorDivStyle></JsonEditor>
						</el-form-item>
					</el-form>
				</el-main>
				<el-footer>
					<el-button type="primary" @click="saveV">保存</el-button>
					<el-button type="primary" @click="cancel">取消</el-button>
				</el-footer>
			</el-container>
		</el-drawer>
	</el-container>
</template>

<style>
</style>
