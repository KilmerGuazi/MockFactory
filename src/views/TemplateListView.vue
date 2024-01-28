<script setup>
import {ref,onMounted,reactive,h,provide,readonly} from 'vue'
import {pageSize,alterMsg,alterConfirmBox,messageType,mockfactoryCommonAutoCompletions,commonTableRowStyle} from '../common/common.js'	
import {queryAllProject,queryAllMsgTemplate,queryMsgTree} from '../http/commonRequest.js'
import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
import {CompletionContext,autocompletion} from "@codemirror/autocomplete"
import {json} from "@codemirror/lang-json"
import axios from '../http/axios'
import TemplateTree from  '../components/MessageTemplateTree.vue'

const loading = ref(true)
let jsonBigint = require('json-bigint')
const msgTemplateEditorDiv = ref(null) // 消息模板输入div
let msgTemplateEditorView = ref(EditorView) // 消息模板输入组件
const total = ref(0) // 分页总数量
const currentPage = ref(1) // 分页当前页数
const createTemplateDrawer = ref(null)
const isDrawerOpen = ref(false)
const drawerTitle = ref('新建')
const templateProjectInputDisabled = ref(false)
const templateTypeInputDisabled = ref(false)
const templateListData = ref([])
// 保存消息模板表单
const saveTemplateForm = ref(null)
// 消息模板数据，用于编辑保存和新建保存
const templateData = reactive({
	'id':'',
	'name':'',
	'type':'',
	'project':{},
	'template':'',
	'comment':null,
	'node_id':1,
	'tree_path': null,
	'creator':localStorage.getItem('user.name')
})


// 项目
const projects = ref([])

// 查询数据
const queryTemplateData = reactive({
	'name':'',
	'project_id':'',
	'node_id':1
})	

// 查询消息模板事件
const queryByCondition = () =>{
	queryAllMsgTemplate(pageSize.value,currentPage.value,queryTemplateData,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			templateListData.value = res.data.data
			total.value = res.data.total
		}else{
			alterMsg('查询消息模板失败',-1)
		}
	})
}

// 新建消息模板事件
const createTemplate = () =>{
	isDrawerOpen.value = true
	templateProjectInputDisabled.value = false
	templateTypeInputDisabled.value = false
	drawerTitle.value = '新建'
}

// 编辑消息模板事件
const editTemplate = (data) =>{
	isDrawerOpen.value = true
	templateProjectInputDisabled.value = true
	templateTypeInputDisabled.value = true
	drawerTitle.value = '编辑'
	templateData.id = data.id
	templateData.name =  data.name
	templateData.project = data.project
	templateData.type = data.type
	templateData.template = data.template
	templateData.comment = data.comment
}

// 新建消息模板抽屉打开事件
const drawerOpened = () =>{
	// 消息模板输入框
	let doc
	if(templateData.template === '' || templateData.template === null || templateData.template === undefined){
		doc = templateData.template
	}else{
		doc = JSON.stringify(JSON.parse(templateData.template),null,'\t')
	}
	let state = EditorState.create({
		doc:doc,
		extensions:[
			basicSetup,
			autocompletion({override:[mockfactoryCommonAutoCompletions]}),
			json()],
		})
	msgTemplateEditorView.value = new EditorView({
		state:state,
		parent:msgTemplateEditorDiv.value,
	})
}


// 抽屉关闭前处理
const drawerBeforeClose = () =>{
	cancel()
}

// 取消保存模板事件
const cancel = () =>{
	saveTemplateForm.value.resetFields()
	createTemplateDrawer.value.close()
	templateData.id = ''
	templateData.name = ''
	templateData.type = ''
	templateData.project = {}
	templateData.template = ''
	templateData.comment = null
}

// 保存
const saveTemplate =()=>{
	saveTemplateForm.value.validate(async(valid)=>{
		if(valid){
			// 验证消息模板是否定义
			let content = msgTemplateEditorView.value.state.doc.toString()
			try{
				content = jsonBigint.parse(content)
				if (JSON.stringify(content) === '{}'){
						throw new Error('消息模板不应该为空')
				}
				templateData.template = content
				axios.post('/mock/msgtemplate/save',templateData).then(res => {
					if(res.status === 200 && res.data.status === 10000){
						alterMsg(res.data.msg,0)
						cancel()
						queryByCondition()
					}else{
						alterMsg(res.data.msg,-1)
					}
				})
			}catch (err){
				alterMsg('请确保消息模板保持json格式且不为空json',-1)
			}
		}
	})
}

// 分页发生改变
const currentPageChange = () =>{
	queryAllMsgTemplate(pageSize.value,currentPage.value,queryTemplateData,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			templateListData.value = res.data.data
			total.value = res.data.total
		}else{
			alterMsg('查询消息模板失败',-1)
		}
	})
}

// 新建消息模板的表单验证规则
const rules = reactive({
	templateName:[
		{
			required:true,
			message:'请设置消息模板名称!',
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
			message:'请选择类型!',
			trigger: 'blur'
		}
	]
})

// 查询对应树节点的消息模板
const queryAllMsgTemplateByNodeId = (nodeId) =>{
	queryAllMsgTemplate(pageSize.value,currentPage.value,{node_id:nodeId},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			templateListData.value = res.data.data
			total.value = res.data.total
		}else{
			alterMsg('查询消息模板失败',-1)
		}
	})
}
provide('msgTemplateRefreshByNodeId',queryAllMsgTemplateByNodeId)

// 更新当前树节点
const updateCurrentTreeNodeId = (node_id,tree_path) =>{
	templateData.node_id = node_id,
	templateData.tree_path = tree_path
	queryTemplateData.node_id = node_id
}
provide('updateCurrentTreeNodeId',updateCurrentTreeNodeId)

	
// 查询所有项目
onMounted(()=>{
	// 查询所有项目
	queryAllProject(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			projects.value = res.data.data
		}
	})
	// 查询所有消息模板
	queryAllMsgTemplate(pageSize.value,currentPage.value,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			templateListData.value = res.data.data
			total.value = res.data.total
		}else{
			alterMsg('查询消息模板失败',-1)
		}
	})

})
</script>

<template>
	<!--生产线管理页面 -->
	<el-container style="height: 100%;width: 100%;">
		<!-- 结构树 -->
		<el-aside width="250px">
			<TemplateTree></TemplateTree>
		</el-aside>
		<!--  查询项和列表 -->
		<el-container>
			<!-- 查询项 -->
			<el-header>
				<el-form :inline="true" :model="queryTemplateData" >
					<el-form-item label="消息模板名称">
					<el-input v-model="queryTemplateData.name" clearable=""></el-input>
					</el-form-item>
					<el-form-item label="项目">
					<el-select v-model="queryTemplateData.project_id" filterable :multiple="false" clearable>
						<el-option
						v-for="tmp in projects"
						:key="tmp.name"
						:label="tmp.name"
						:value="tmp.id"
						>
						</el-option>
					</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="queryByCondition">查询</el-button>
						<el-button type="primary" @click="createTemplate">新建</el-button>
					</el-form-item>
				</el-form>
			</el-header>
			<!-- 消息模板列表 -->
        	<el-main>
				<el-table :data="templateListData" :row-style="commonTableRowStyle" :header-cell-style="{background:'#f0f4ff'}" style="width: 100%; " stripe border>
					<el-table-column prop="id" label="id" align="center" width="100"></el-table-column>
					<el-table-column prop="name" label="模板名称" align="left" show-overflow-tooltip width="250"></el-table-column>
					<el-table-column prop="project.name" label="项目名称" align="center" width="100"></el-table-column>
					<el-table-column prop="type" label="类型" align="center" width="100">
						<template #default="scope" >
							<el-tag v-if="scope.row.type === 1" type="success">JSON</el-tag>
							<el-tag v-else type="success">未知</el-tag>
						</template>
					</el-table-column>
					<el-table-column prop="comment" label="备注" align="center" show-overflow-tooltip width="200"></el-table-column>
					<el-table-column prop="tree_path" label="节点" align="center" show-overflow-tooltip></el-table-column>
					<el-table-column prop="creator" label="创建人" align="center" show-overflow-tooltip width=100></el-table-column>
					<el-table-column prop="update_time" label="更新时间" align="center" width="200"></el-table-column>
					<el-table-column prop="operation" label="操作" align="center" width="100">
						<template #default="scope">
							<el-button type="text" size="small" @click="editTemplate(scope.row)">编辑</el-button>
						</template>
					</el-table-column>
				</el-table>
				<el-row style="margin-top: 20px;">
					<el-col :span="6" :offset="15" style="display: flex;align-items: center;">
						<el-pagination layout="prev, pager, next" v-model:currentPage="currentPage" :page-size="pageSize" :total="total" @current-change="currentPageChange"></el-pagination>
					</el-col>
				</el-row>
			</el-main>
		</el-container>
		<!-- 创建、编辑消息模板的抽屉-->
		<el-drawer ref='createTemplateDrawer' v-model="isDrawerOpen" :title="drawerTitle" :direction="direction" :before-close="drawerBeforeClose" :destroy-on-close = "true" @opened='drawerOpened' size="50%">
			<el-container>
				<el-main>
					<el-form ref="saveTemplateForm" :model="templateData" label-position="top" label-width="100px" style="height: 100%;">
						<el-form-item prop="name" label="消息模板名称" :rules="rules.templateName">
							<el-input v-model="templateData.name"/>
						</el-form-item>
						<el-form-item prop='project.id' label="项目" :rules="rules.projectId">
							<el-select v-model="templateData.project.id" filterable :multiple="false" style="width: 100%;" :disabled="templateProjectInputDisabled">
							  <el-option
							    v-for="tmp in projects"
							    :key="tmp.name"
							    :label="tmp.name"
							    :value="tmp.id"
							  >
							  </el-option>
							</el-select>
						</el-form-item>
						<el-form-item prop="type" label="消息类型" :rules="rules.type">
							<el-select v-model="templateData.type" filterable :multiple="false" placeholder="请选择类型"
										clearable 
										:disabled="templateTypeInputDisabled"
										style="width: 100%;">
								<el-option
									v-for="tmp in messageType"
									:key="tmp.name"
									:label="tmp.name"
									:value="tmp.value"
								>
							  </el-option>
							</el-select>
						</el-form-item>
						
						<el-form-item prop="comment" label="备注">
							<el-input v-model="templateData.comment"/>
						</el-form-item>
						<!-- 消息模板输入框 -->
						<div ref='msgTemplateEditorDiv' style="width: 100%;height: 60%;">
							
						</div>
						<el-alert
						    title="提示"
						    type="info"
						    description='消息模板需要保持json格式,例如{"key1":value1,"key2":"value2"}'
						    show-icon
							style="margin-top: 5px;"
						></el-alert>
					</el-form>
				</el-main>
				<el-footer style="margin-top: 10px;">
					<el-button type="primary" @click="saveTemplate()">保存</el-button>
					<el-button type="primary" @click="cancel">取消</el-button>
				</el-footer>
			</el-container>
		</el-drawer>
	</el-container>
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
