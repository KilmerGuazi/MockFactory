<script setup>
import { Delete, Edit, Search, Share, Upload,Plus } from '@element-plus/icons-vue'
import {ref,onMounted,reactive,h,inject,unref} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {queryAllProject,queryAllMsgTemplate,queryMsgTree,queryNodePathInMsgTree} from '../http/commonRequest.js'
import {alterMsg} from '../common/common.js'
import axios from '../http/axios'
	
const msgTemplateRefreshByNodeId = inject('msgTemplateRefreshByNodeId')	// 父页面刷新消息模板列表
const updateCurrentTreeNodeId = inject('updateCurrentTreeNodeId') // 父页面更新当前树节点id

const treeLoading = ref(true)
const treeData = ref(null)

const addNodeDialogFormVisible = ref(false)
const addNodeDialogFormTitle = ref("添加节点")
const addNodeDialogForm = ref(null)
const addNodeDialogData = reactive({
  name: null,
  parent_id:null
})

const defaultProps = {
	id :'id',
	parent_id:'parent_id',
	label: 'label',
	children: 'children'
}

// 点击树的右键菜单的添加
const addNode = (data) =>{
	addNodeDialogData.parent_id = data.data.id
	// 弹窗确认界面名称
	addNodeDialogFormTitle.value = "\'" + data.data.label + "\'" + "添加子节点"
	addNodeDialogFormVisible.value = true
}

// 确认添加
const confirmAdd = () =>{
	console.log(addNodeDialogData)
	addNodeDialogForm.value.validate(async(valid)=>{
		if(valid){
			// 保存节点
			axios.post('/mock/messagetree/add',addNodeDialogData).then(res=>{
				if(res.status === 200 && res.data.status === 10000){
					alterMsg(res.data.msg,0)
					addNodeDialogFormVisible.value = false
					// 清空以保存的内容
					addNodeDialogData.name = null
					// 刷新树
					queryMsgTree((res)=>{
						if(res.status === 200 && res.data.status === 10000){
							treeData.value = res.data.data
						}
					})
				}else{
					alterMsg(res.data.msg,1)
				}
			})
		}
	})
}

// 取消添加
const cancelAdd = () =>{
	addNodeDialogFormVisible.value = false
	// 清空以保存的内容
	addNodeDialogData.name = null
}

// 删除节点
const deleteNode = (data) =>{
	axios.post('/mock/messagetree/delete',{id:data.data.id}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			alterMsg(res.data.msg,0)
			// 刷新树
			queryMsgTree((res)=>{
				if(res.status === 200 && res.data.status === 10000){
					treeData.value = res.data.data
				}
			})
		}else{
			alterMsg(res.data.msg,1)
		}
	})
}

// 查看节点
const viewNode = (data) =>{
	let node_id = data.data.id
	queryNodePathInMsgTree(node_id,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			// 刷新父页面消息模板列表
			msgTemplateRefreshByNodeId(node_id)
			// 更新父页面当前树节点id
			updateCurrentTreeNodeId(node_id,res.data.data.node_path)
		}
	})
}


// 新建消息模板的表单验证规则
const rules = reactive({
	name:[
		{
			required:true,
			message:'请设置节点名称!',
			trigger: 'blur'
		}
	]
})

onMounted(()=>{
	// 消息树
	treeLoading.value = true
	queryMsgTree((res)=>{
		if(res.status === 200 && res.data.status === 10000){
			treeData.value = res.data.data
		}
	})
	treeLoading.value = false
})

</script>

<template>
	<!-- 树的鼠标右键菜单-->
	<context-menu >
		<context-menu-item divider @itemClickHandle="addNode"> 添加节点 </context-menu-item>
		<context-menu-item divider @itemClickHandle="deleteNode"> 删除 </context-menu-item>	
		<context-menu-item @itemClickHandle="viewNode"> 查看 </context-menu-item>
  	</context-menu>

	<el-scrollbar v-loading="treeLoading" element-loading-text="加载中..." >
			<el-tree :data="treeData" :indent="0" node-key="id" :props="defaultProps" default-expand-all="true" expand-on-click-node="false" style="height: 100%; width: 100%;" >
				<template #default="{ node, data }">
					<span style="font-size: smaller;margin-right: 20px;" v-contextmenu="{node:node,data:data}">{{ node.label }}</span>
				</template>			
		</el-tree>
	</el-scrollbar>

	<el-dialog v-model="addNodeDialogFormVisible" :title="addNodeDialogFormTitle" width="25%">
		<el-form ref="addNodeDialogForm"  :model="addNodeDialogData">
		<el-form-item prop="name" label="节点名称" :rules="rules.name">
			<el-input v-model="addNodeDialogData.name"/>
		</el-form-item>
		</el-form>
		<template #footer>
		<span class="dialog-footer">
			<el-button @click="cancelAdd()">取消</el-button>
			<el-button type="primary" @click="confirmAdd()">添加</el-button>
		</span>
		</template>
	</el-dialog>
</template>


<style>



.el-tree-node {
position: relative;
padding-left: 5px;
}
.el-tree-node__children {
padding-left: 10px;
}

.el-tree-node :last-child:before {
height: 38px;
}

.el-tree > .el-tree-node:before {
border-left: none;
}

.el-tree > .el-tree-node:after {
border-top: none;
}

.el-tree-node:before {
content: "";
left: -4px;
position: absolute;
right: auto;
border-width: 1px;
border-left: 1px solid #c1c4c4;
bottom: 0px;
height: 100%;
top: -26px;
width: 1px;
}

.el-tree-node:after {
content: "";
left: -4px;
position: absolute;
right: auto;
border-width: 1px;
border-top: 1px solid #c1c4c4;
height: 20px;
top: 12px;
width: 18px;
}
.el-tree .el-tree-node__expand-icon.expanded {
-webkit-transform: rotate(90deg);
transform: rotate(90deg);
}
.el-tree .el-icon-caret-right:before {
content: "\e723";
font-size: 16px;
color: #1389bc;
position: absolute;
left: -20px;
top: -8px;
}
.el-tree .el-tree-node__expand-icon.expanded.el-icon-caret-right:before {
content: "\21E0";
font-size: 16px;
color: #1389bc;
position: absolute;
left: -20px;
top: -8px;
}
.el-tree-node__expand-icon.is-leaf:before {
content: "\e722";
font-size: 16px;
color: #1389bc;
position: absolute;
left: -20px;
top: -8px;
}
.el-tree-node__content > .el-tree-node__expand-icon {
padding: 0;
}

.el-scrollbar__wrap {
display: flex;
}


</style>
