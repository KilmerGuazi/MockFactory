<script setup>
import {ref,onMounted,reactive,h} from 'vue'
import {workerType,pageSize,alterMsg,alterConfirmBox,commonTableRowStyle} from '../common/common.js'	
import {queryAllProject,queryAllWorker,queryAllProductLine,queryAllUser} from '../http/commonRequest.js'
import axios from '../http/axios'
import {
  Check,
  Delete,
  Edit,
  Message,
  Search,
  Star,
} from '@element-plus/icons-vue'

const loading = ref(true)
const total = ref(0) // 分页总数量
const currentPage = ref(1) // 分页当前页数
const createProductLineDrawer = ref(null)
const isDrawerOpen = ref(false)
const productLineListData = ref([])
// 项目
const projects = ref([])
// 工人
const workers = ref([])
// 创建人
const creators = ref([])
// 保存生产线表单
const saveProductLineForm = ref(null)
//生产线数据，用于编辑保存和新建保存
const productLineData = reactive({
	'productLineId':'',
	'productLineName':'',
	'projectId':'',
	'projectName':'',
	'relations':[],
	'creator':localStorage.getItem('user.name')
})
// 查询数据
const queryProductLineData = reactive({
	'name':'',
	'project_id':'',
	'creator':''
})	
// 条件查询
const queryByCondition = () => {
	loading.value = true
	queryAllProductLine(pageSize.value,1,queryProductLineData,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			productLineListData.value = res.data.data
			total.value = res.data.total
			currentPage.value = 1
		}else{
			alterMsg('查询生产线失败',-1)
		}
		loading.value = false
	})
}
// 新建
const createProductLine = () =>{
	isDrawerOpen.value = true
	
}
// 抽屉关闭前处理
const drawerBeforeClose = () =>{
	cancel()
}
// 抽屉打开后处理
const drawerOpened = () =>{
	
}

// 分页发生改变
const currentPageChange = () =>{
	loading.value = true
	queryAllProductLine(pageSize.value,currentPage.value,queryProductLineData,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			productLineListData.value = res.data.data
			total.value = res.data.total
		}else{
			alterMsg('查询生产线失败',-1)
		}
		loading.value = false
	})
}

// 自定义校验生产线工人信息
const validateRelationsInfo = (rule, value, callback) => {
	if (value===undefined ||value.relationOrder === '' || value.relationOrder === undefined || value.worker.workerId === '' || value.worker.workerId === undefined ){
		callback(new Error('请设置的工人'))
	}else{
		callback()
	}
}

// 保存生产线表单校验规则
const saveRules = reactive({
	productLineName:[
		{
			required:true,
			message:'请设置名称!',
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
	workers:[
		{
			required:true,
			message:'请选择工人！',
			trigger: 'blur'
		}
	],
	relations:[{
		required:true,
		validator:validateRelationsInfo,
		trigger: 'blur'
	}]
})

// 保存生产线事件
const saveProductLine = () =>{
	console.log(productLineData)
	saveProductLineForm.value.validate(async(valid)=>{
		if(valid){
			await axios.post('/mock/productLine/save',productLineData).then(res=>{
				if(res.status === 200 && res.data.status === 10000){
					alterMsg(res.data.msg,0)
					cancel()
					queryByCondition()
				}else{
					alterMsg(res.data.msg,-1)
				}
			})
		}
	})
}

// 取消保存生产线事件
const cancel = () =>{
	saveProductLineForm.value.resetFields()
	createProductLineDrawer.value.close()
	productLineData.productLineId = ''
	productLineData.productLineName = ''
	productLineData.projectId = ''
	productLineData.projectName = ''
	productLineData.relations = []
	productLineData.creator= localStorage.getItem('user.name')
}

// 新增工人
const addWorker = () =>{
	let relation = {
		relationOrder:productLineData.relations.length + 1,
		worker:{
			'workerId':'',
			'workerName':''
		}
	}
	productLineData.relations.push(relation)
}

// 删除工人
const deleteWorker = (scope,index,workerId) =>{
	productLineData.relations.splice(index,1)
	// 删除工人后需要重新排序
	productLineData.relations.forEach((relation,index)=>{
		relation.relationOrder = index + 1
	})
	productLineData.relations.sort((a,b)=>{
		return a.relationOrder - b.relationOrder
	})
}

// 删除生产线
const deleteProductLine = (id) =>{
	axios.post('/mock/productLine/delete',{"id":id}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			alterMsg("删除成功",0)
			queryByCondition()
		}else{
			alterMsg("删除失败",-1)
		}
	})
}

// 禁用生产线
const disableProductLine = (id,disabled) =>{
	axios.post('/mock/productLine/disable',{"id":id,"disabled":disabled}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			alterMsg("禁用成功",0)
			queryByCondition()
		}else{
			alterMsg("禁用失败",-1)
		}
	})
}

// 收藏生产线
const favoriteProductLine = (id,favorite) =>{
	axios.post('/mock/productLine/favorite',{"id":id,"favorite":favorite}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			alterMsg(favorite === 0? "取消收藏成功":"收藏成功",0)
			queryByCondition()
		}else{
			alterMsg(favorite === 0? "取消收藏失败":"收藏失败",-1)
		}
	})
}

// 过滤是否收藏
const filterFavorite = (value,row,column) =>{
	const property = column['property']
  	return row[property] === value
}

// 编辑生产线
const editProductLine = (data) =>{
	console.log(data)
	productLineData.productLineId = data.productLineId
	productLineData.productLineName = data.productLineName
	productLineData.projectId = data.project.projectId
	productLineData.projectName = data.project.projectName
	productLineData.relations = data.relations
	isDrawerOpen.value = true
}

// 运行生产线
const launchProductLine = (data) => {
	alterConfirmBox('注意!',`请确认是否需要运行生产线"${data.productLineName}"?`,()=>{
		// 确认运行
		axios.post('/mock/launchJob/save',{productLine:data}).then(res=>{
			if(res.status === 200 && res.data.status === 10000){
				// 运行
				launch(data,res.data.data)
			}else{
				alterMsg('创建任务失败!',-1)
			}
		})
	})
}

// 运行
const launch = (productLine,launchJob) =>{
	let param = {
		productLine:productLine,
		launchJob:launchJob
	}
	axios.post('/mock/productLine/launch',param).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			alterMsg('运行任务成功，请到生产记录页面查看结果和明细!',0)
		}else{
			alterMsg('运行任务失败，请到生产记录页面查看结果和明细!',-1)
		}
	})
}



// 新建或保存时项目选择器内容发生变更
const projectChange =(currentValue) =>{
	queryAllWorker(10000,1,{"project_id":currentValue},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			workers.value = res.data.data
			productLineData.relations = []
		}
	})
}

// "更多"按钮点击
const beforeHandleMoreAction = (data,action) => {
	return {
		'row':data,
		'action':action
	}
}

// “更多子菜单”事件处理
const handleMoreAction = (command) =>{
	console.log(command)
	if(command.action === 'delete'){
		console.log('delete')
	}else if(command.action === 'edit'){
		console.log('edit')
		editProductLine(command.row)
	}else if(command.action === 'run'){
		console.log('run')
		launchProductLine(command.row)
	}
}


onMounted(()=>{
	// 查询所有项目
	queryAllProject(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			projects.value = res.data.data
		}
	})
	// 查询所有工人
	queryAllWorker(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			workers.value = res.data.data
		}
	})
	// 查询所有用户
	queryAllUser((res)=>{
		creators.value = res.data.data
	})
	// 查询所有生产线
	queryAllProductLine(pageSize.value,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			loading.value = false
			productLineListData.value = res.data.data
			total.value = res.data.total
		}
	})
})

</script>

<template>
	<!--生产线管理页面 -->
	<el-container style="height: 100%;width: 100%;">
		<!--查询-->
		<el-header>
			<el-form :inline="true" :model="queryProductLineData" >
				<el-form-item label="生产线名称">
				  <el-input v-model="queryProductLineData.name" clearable=""></el-input>
				</el-form-item>
				<el-form-item label="项目">
				  <el-select v-model="queryProductLineData.project_id" filterable :multiple="false" clearable>
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
				  <el-select v-model="queryProductLineData.creator" filterable :multiple="false" clearable>
				    <el-option
				      v-for="tmp in creators"
				      :key="tmp.id"
				      :label="tmp.name"
				      :value="tmp.name"
				    >
				    </el-option>
				  </el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="queryByCondition">查询</el-button>
					<el-button type="primary" @click="createProductLine">新建</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="productLineListData" :row-style="commonTableRowStyle" :header-cell-style="{background:'#f0f4ff'}" style="width: 100%; "  v-loading="loading" element-loading-text="加载数据中..." stripe border >
				<el-table-column prop="favorite" lable="收藏" width="80" align="center" :filters="[{text:'是',value:1},{text:'否',value:0}]" :filter-method="filterFavorite">
					<template #default="scope">
						<el-popconfirm v-if="scope.row.favorite === 0" title="确认收藏吗?" confirmButtonText='确认' cancelButtonText='取消' @confirm="favoriteProductLine(scope.row.productLineId,1)">
							<template #reference>
								<el-button  circle><el-icon><Star /></el-icon></el-button>
							</template>
						</el-popconfirm>
						<el-popconfirm v-else-if="scope.row.favorite === 1" title="确认取消收藏吗?" confirmButtonText='确认' cancelButtonText='取消' @confirm="favoriteProductLine(scope.row.productLineId,0)">
							<template #reference>
								<el-button  type= "success" circle><el-icon><Star /></el-icon></el-button>
							</template>
						</el-popconfirm>
					</template>
					<!-- <template #default="scope">
							<el-button  v-if="scope.row.favorite === 0" circle><el-icon><Star /></el-icon></el-button>
							<el-button  v-else-if="scope.row.favorite === 1" type= "success" circle><el-icon><Star /></el-icon></el-button>
					</template> -->
				</el-table-column>
				<el-table-column prop="productLineId" label="id" align="center" width="50"></el-table-column>
				<el-table-column prop="productLineName" label="生产线名称" align="left" show-overflow-tooltip="true" width="300"></el-table-column>
				<el-table-column prop="project.projectName" label="项目名称" align="center" width="100"></el-table-column>
				<el-table-column label="工人" align="center" width="100">
					<template #default="{row,$index}">
						<!-- <el-tag v-for="relation in row.relations" style="margin-right: 2px;">{{relation.worker.workerName}}</el-tag> -->
						<el-popover placement="right" :width="400" trigger="hover">
							<template #reference>
								<el-tag>工人</el-tag>
							</template>
						  <el-table :data="row.relations">
								<el-table-column :width="100" property="relationId" label="id" />
								<el-table-column :width="100" property="relationOrder" label="顺序" />
								<el-table-column :width="200" property="worker.workerName" label="工人" />
						  </el-table>
						</el-popover>
					</template>
				</el-table-column>
				<el-table-column prop="creator" label="创建人" align="center"></el-table-column>
				<el-table-column prop="updateTime" label="更新时间" align="center"></el-table-column>
				<el-table-column prop="operation" label="操作" align="center">
					<template #default="scope">
						<el-popconfirm title="你确认要删除此生产线吗?" confirmButtonText='确认' cancelButtonText='取消' @confirm="deleteProductLine(scope.row.productLineId)">
							<template #reference>
								<el-button type="text" size="small">删除</el-button>
							</template>
						</el-popconfirm>
						<el-button type="text" size="small" @click="disableProductLine(scope.row.productLineId,scope.row.disabled)">
							<span v-if="scope.row.disabled === 0">禁用</span>
							<span v-else>启用</span>
						</el-button>
						<!-- <el-button type="text" size="small" @click="editProductLine(scope.row)">编辑</el-button>
						<el-button type="text" size="small" @click="launchProductLine(scope.row)" >运行</el-button> -->
						<el-dropdown @command="handleMoreAction" style="padding-left:10px;margin-top:5.5px">
							<span><font class="more" >更多</font></span>
							<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item :command="beforeHandleMoreAction(scope.row,'edit')"><span><font class="more" >编辑</font></span></el-dropdown-item>
								<el-dropdown-item :command="beforeHandleMoreAction(scope.row,'run')"><span><font class="more" >运行</font></span></el-dropdown-item>
							</el-dropdown-menu>
							</template>
						</el-dropdown>
					</template>
				</el-table-column>
			</el-table>
			<el-row style="margin-top: 20px;">
				<el-col :span="6" :offset="18" style="display: flex;align-items: center;">
					<el-pagination layout="prev, pager, next" v-model:currentPage="currentPage" :page-size="pageSize" :total="total" @current-change="currentPageChange"></el-pagination>
				</el-col>
			</el-row>
		</el-main>
		<!-- 创建、编辑生产线的抽屉-->
		<el-drawer ref='createProductLineDrawer' v-model="isDrawerOpen" title="编辑工人" :direction="direction" :before-close="drawerBeforeClose" :destroy-on-close = "true" @opened='drawerOpened' size="50%">
			<el-container>
				<el-main>
					<el-form ref="saveProductLineForm" :model="productLineData" :rules="saveRules" label-position="top" label-width="100px" style="height: 100%;">
						<el-form-item prop="productLineName" label="生产线名称">
							<el-input v-model="productLineData.productLineName"/>
						</el-form-item>
						<el-form-item prop='projectId' label="项目">
							<el-select v-model="productLineData.projectId" filterable :multiple="false" @change='projectChange' style="width: 100%;">
							  <el-option
							    v-for="tmp in projects"
							    :key="tmp.name"
							    :label="tmp.name"
							    :value="tmp.id"
							  >
							  </el-option>
							</el-select>
						</el-form-item>
						<el-table :data="productLineData.relations" style="width: 100%;">
							<el-table-column label="工作顺序" align="center">
								<template #default="{row,$index}">
									<span>{{ row.relationOrder }}</span>
								</template>
							</el-table-column>
							<el-table-column label="工人" align="center">
								<template #default="{row,$index}">
									<el-form-item :prop="`relations.${$index}`" :rules="saveRules.relations">
										<el-select v-model="row.worker.workerId" filterable :multiple="false" style="width: 100%;">
										  <el-option
											v-for="tmp in workers"
											:key="tmp.worker_name"
											:label="tmp.worker_name"
											:value="tmp.worker_id"
										  >
										  </el-option>
										</el-select>
									</el-form-item>
								</template>
							</el-table-column>
							<el-table-column prop="operation" label="操作" align="center">
								<template #default="scope">
									<el-button type="text" size="small" @click="deleteWorker(scope,scope.$index,scope.row.workerId)">删除</el-button>
								</template>
							</el-table-column>
						</el-table>
						<el-button type="primary"  @click="addWorker()" style="margin-top: 20px;">新增</el-button>
					</el-form>
				</el-main>
				<el-footer style="margin-top: 10px;">
					<el-button type="primary" @click="saveProductLine">保存</el-button>
					<el-button type="primary" @click="cancel">取消</el-button>
				</el-footer>
			</el-container>
		</el-drawer>
	</el-container>
</template>



<style>
.more  {
	font-size: 12px;
	font-family: Arial;
	color: #409eff;
	font-weight: 500;
}
</style>
