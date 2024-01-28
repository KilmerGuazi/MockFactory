<script setup>
import {inject,ref,onMounted,reactive,h} from 'vue'
import axios from '../http/axios'
import {alterMsg,alterConfirmBox,datasourceType} from '../common/common.js'	
import {queryAllProject,queryAllWorker,queryAllDataSource,queryAllVariables,queryDataTemplate} from '../http/commonRequest.js'

const isDrawerOpen = inject('sqlDrawerOpen', false) // 父页面传递的数据，抽屉是否打开
const currentWorkerId = inject('workerId',0) // 父页面传递的数据，当前工人id
const currentWorkerType = inject('workerType',1)// 父页面传递的数据，当前工人类型
const projects = inject('projects',[])// 父页面传递的数据，所有项目信息
const isCreateWorker = inject('isCreateWorker',false) // 父页面传递的数据，是否是创建工人
const workerListRefresh = inject('workerListRefresh') // 父页面传递的函数，查询工人，用户保存工人刷新父页面的列表


const saveWorkerForm = ref(null)
const drawer = ref(null)
const templates = ref([])

// 设置项是否可编辑
const nameDisabled = ref(false)
const typeDisabled = ref(false)
const projectDisabled = ref(false)

/**
 * 工人数据
 */
const worker = ref({
	id:'',
	name:'',
	type:'',
	project:{},
	content:[],
	creator:localStorage.getItem('user.name')
}) 

// 抽屉打开时的事件
const drawerOpen = () =>{
	if(isCreateWorker.value){
		// 新建
		nameDisabled.value = false
		typeDisabled.value = true
		projectDisabled.value = false
		// 设置类型
		worker.value.type = currentWorkerType.value
	}else{
		// 编辑
		nameDisabled.value = false
		typeDisabled.value = true
		projectDisabled.value = true
		// 查询当前工人的信息
		axios.post('/mock/worker/detail/query',{id:currentWorkerId.value,type:currentWorkerType.value}).then(res=>{
			if(res.status === 200 && res.data.status === 10000){
				worker.value = res.data.data
			}else{
				alterMsg('查询工人明细失败',-1)
			}
		})
	}

	// 查询数据模板
	queryDataTemplate(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			templates.value = res.data.data
		}else{
			alterMsg('查询数据模板失败',-1)
		}
	})
}	

// 取消
const cancel = () =>{
	saveWorkerForm.value.resetFields()
	drawer.value.close()
	// 清除已有数据
	worker.value.id = ''
	worker.value.name = ''
	worker.value.type = ''
	worker.value.project = {}
	worker.value.content = []
}

// 保存
const save = () =>{
	// if(isCreateWorker.value) {
	// 	// 新建保存
	// 	let tmpContent = {db_name:createDBName.value,variables_ids:createVariableIds.value,content:sqlEditorView.value.state.doc.toString()}
	// 	worker.value.content[0]=tmpContent
	// }else{
	// 	// 编辑保存
	// 	worker.value.content[0].content = sqlEditorView.value.state.doc.toString()
	// }
	saveWorkerForm['value'].validate(async(valid)=>{
		if(valid){
			await axios.post('/mock/worker/sql/save',worker.value).then(res=>{
				if(res.status === 200 && res.data.status === 10000){
					cancel()
					alterMsg(res.data.msg,0)
					workerListRefresh()
				}else{
					alterMsg(res.data.msg,-1)
				}
			})
		}
	})
}

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

// 自定义校验数据顺序和消息id
const validateTemplatesId = (rule, value, callback) => {
	if (value===undefined ||value.order === '' || value.order === undefined || value.template.id === '' || value.template.id === undefined ){
		callback(new Error('请设置消息模板'))
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
	type:[
		{
			required:true,
			message:'请输入工人类型',
			trigger: 'blur'
		}
	],
	project:[
		{
			required:true,
			message:'请设置项目',
			trigger: 'blur'
		}
	],
	templatesId:[{
		validator: validateTemplatesId, trigger: 'blur'
	}],
})	
</script>

<template>
	<el-drawer ref="drawer" v-model="isDrawerOpen" title="编辑工人" :destroy-on-close = "true" @open="drawerOpen" @opened="drawerOpened" size="50%">
		<el-container style="width: 100%;height: 100%;">
			<el-main>
				<el-form ref="saveWorkerForm" :model="worker" :rules="saveWorkerRules" label-position="top" label-width="100px" style="height: 100%;">
					<!-- 工人名称 -->
					<el-form-item prop="name" label="工人名称" :rules="rules.name">
						<el-input v-model="worker.name" :disabled="nameDisabled"/>
					</el-form-item>

					<el-form-item prop='type' label="工人类型" :rules="rules.type">
						<el-select v-model="worker.type" filterable :multiple="false" style="width: 100%;" :disabled="typeDisabled">
						  <el-option
							v-for="tmp in datasourceType"
							:key="tmp.name"
							:label="tmp.name"
							:value="tmp.value"
						  >
						  </el-option>
						</el-select>
					</el-form-item>

					<!--项目-->
					<el-form-item prop='project.id' label="项目" :rules="rules.project">
						<el-select v-model="worker.project.id" filterable :multiple="false" :disabled="projectDisabled" style="width: 100%;">
						  <el-option
							v-for="tmp in projects"
							:key="tmp.name"
							:label="tmp.name"
							:value="tmp.id"
						  >
						  </el-option>
						</el-select>
					</el-form-item>

					<!--数据模板-->
					<el-table :data="worker.content" style="width: 100%;">
						<el-table-column label="序号" align="center">
							<template #default="{row,$index}">
								<span>{{ row.order }}</span>
							</template>
						</el-table-column>
						<el-table-column label="数据模板" align="center">
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
						<el-table-column prop="operation" label="操作" align="center">
							<template #default="scope">
								<el-button type="text" size="small" @click="deleteTemplate(scope,scope.$index,scope.row.id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
					<el-button type="primary"  @click="addTemplate()" style="margin-top: 20px;">新增</el-button>
				</el-form>
			</el-main>
			<el-footer style="margin-top: 10px;">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button type="primary" @click="cancel">取消</el-button>
			</el-footer>
		</el-container>
	</el-drawer>
</template>

<style>
	.cm-scroller {
			overflow: 
			auto; 
		}
		
	.cm-editor {
		height: 100%;
		width: 100%;
	}
</style>
