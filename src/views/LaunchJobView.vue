<script setup>
import {ref,onMounted,reactive,h} from 'vue'
import {workerType,pageSize,alterMsg,alterConfirmBox,commonTableRowStyle} from '../common/common.js'	
import {queryAllProject,queryAllWorker,queryAllProductLine,queryAllLaunchJob} from '../http/commonRequest.js'
import axios from '../http/axios'

const loading = ref(true)
const jobDetails = ref([])	//生产线任务执行进度显示对应数据
const currentPage = ref(1)	// 分页当前页数
const dialogTitle = ref('进度')	//生产线任务执行进度弹窗标题
const dialogVisiable = ref(false)	//生产线任务执行进度弹窗是否显示
const logDialogVisiable = ref(false) // 生产线任务执行节点日志弹窗是否显示
const logData=ref('') // 需要展示的日志
const total = ref(0)	// 分页总数量
const projects = ref([])	// 项目
const productLines = ref([]) // 生产线
// 查询数据
const queryLaunchJobData = reactive({
	productline_id:''
})
// 任务列表数据
const launchJobListData = ref([])

// 条件查询
const queryByCondition = () =>{
	queryAllLaunchJob(pageSize.value,1,queryLaunchJobData,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			launchJobListData.value = res.data.data
			total.value = res.data.total
		}else{
			alterMsg('查询生产线失败',-1)
		}
	})
}

// 打开任务详情
const launchJobDetail = (id) =>{
	// 查询明细数据
	axios.post('/mock/launchJobDetail/query',{launchJobId:id}).then(res=>{
		if(res.status === 200 && res.data.status === 10000){
			// 打开dialog
			dialogVisiable.value = true
			jobDetails.value = res.data.data
		}else{
			alterMsg('查询任务明细数据失败!',-1)
		}
	})
	
}

// 分页发生改变
const currentPageChange = () =>{
	queryAllLaunchJob(pageSize.value,currentPage.value,queryLaunchJobData,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			launchJobListData.value = res.data.data
			total.value = res.data.total
		}else{
			alterMsg('查询生产线失败',-1)
		}
	})
}

// 点击查看日志按钮
const showLogClick = (log) => {
	logDialogVisiable.value = true
	logData.value = log
} 

// 挂载
onMounted(()=>{
	// 查询所有项目
	queryAllProject(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			projects.value = res.data.data
		}
	})
	// 查询所有生产线
	queryAllProductLine(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			productLines.value = res.data.data
		}
	})
	// 查询所有任务
	queryAllLaunchJob(pageSize.value,currentPage.value,{},(res)=>{
		loading.value = true
		if(res.status === 200 && res.data.status === 10000){
			launchJobListData.value = res.data.data
			total.value = res.data.total
		}
		loading.value = false
	})
})
</script>

<template>
	<!--生产线管理页面 -->
	<el-container style="height: 100%;width: 100%;">
		<!--查询-->
		<el-header>
			<el-form :inline="true" :model="queryLaunchJobData" >
				<el-form-item label="生产线">
				  <el-select v-model="queryLaunchJobData.productline_id" filterable :multiple="false" clearable>
				    <el-option
				      v-for="tmp in productLines"
				      :key="tmp.productLineName"
				      :label="tmp.productLineName"
				      :value="tmp.productLineId"
				    >
				    </el-option>
				  </el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="queryByCondition">查询</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="launchJobListData" :row-style="commonTableRowStyle" :header-cell-style="{background:'#f0f4ff'}" style="width: 100%; "  v-loading="loading" element-loading-text="加载数据中..." stripe border>
				<el-table-column prop="launchJobId" label="id" align="center" width="50"></el-table-column>
				<el-table-column prop="launchJobName" label="任务名称" align="left" show-overflow-tooltip="true" width="350"></el-table-column>
				<el-table-column prop="productLine.productLineName" label="生产线" show-overflow-tooltip="true" align="left" width="200"></el-table-column>
				<el-table-column prop="project.projectName" label="项目名称" align="center" width="100">
					<template #default="{row,$index}">
						<el-tag type="success">{{row.project.projectName}}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="状态" align="center" width="80">
					<template #default="scope">
						<span v-if="scope.row.launchJobStatus === 0" style="color:darkblue;">未开始</span>
						<span v-else-if="scope.row.launchJobStatus === 1" style="color: blue;">进行中</span>
						<span v-else-if="scope.row.launchJobStatus === 2" style="color: green;">完成</span>
						<span v-else style="color: red;">异常</span>
					</template>
				</el-table-column>
				<el-table-column prop="launchJobStartTime" label="开始时间" align="center" width="180"></el-table-column>
				<el-table-column prop="launchJobEndTime" label="结束时间" align="center" width="180"></el-table-column>
				<el-table-column prop="creator" label="创建人" align="center"></el-table-column>
				<!-- <el-table-column prop="updateTime" label="更新时间" align="center"></el-table-column> -->
				<el-table-column prop="operation" label="操作" align="center">
					<template #default="scope">
						<el-button type="text" size="small" @click="launchJobDetail(scope.row.launchJobId)">详情</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-row style="margin-top: 20px;">
				<el-col :span="6" :offset="18" style="display: flex;align-items: center;">
					<el-pagination layout="prev, pager, next" v-model:currentPage="currentPage" :page-size="pageSize" :total="total" @current-change="currentPageChange"></el-pagination>
				</el-col>
			</el-row>
		</el-main>
		<!-- 任务执行框-->
		<el-dialog v-model="dialogVisiable" :title="dialogTitle">
			<el-scrollbar height="600px">
				<el-timeline>
					<el-timeline-item v-for="(detail, index) in jobDetails" 
						:key="index"
						placement="top"
						:center="true" 
						:timestamp="detail.launchJobDetailOrder"
						:hollow="false"
						type="primary"
						>
						  <el-card>
							<h4>{{detail.launchJobDetailName}}</h4>
							<p>状态：
								<span v-if="detail.launchJobDetailStatus === 0" style="color:darkblue;">未开始</span>
								<span v-else-if="detail.launchJobDetailStatus === 1" style="color: blue;">进行中</span>
								<span v-else-if="detail.launchJobDetailStatus === 2" style="color: green;">完成</span>
								<span v-else style="color: red;">异常</span>
							</p>
							<p>开始时间：{{detail.launchJobDetailStartTime}}</p>
							<p>结束时间：{{detail.launchJobDetailEndTime}}</p>
							<el-button  v-if="detail.launchJobDetailStatus=== -1" type="text" size="small" @click="showLogClick(detail.launchJobDetailLog)">日志</el-button>
						  </el-card>
					</el-timeline-item>
				</el-timeline>
			</el-scrollbar>
		    <template #footer>
		      <span class="dialog-footer">
		        <el-button type="primary" @click="dialogVisiable = false">确认</el-button>
		      </span>
		    </template>
		</el-dialog>
		<el-dialog title="日志" v-model="logDialogVisiable">
			<el-input v-model="logData" :autosize="{ minRows: 2, maxRows: 20 }" type="textarea" readonly/>
		</el-dialog>
	</el-container>
</template>

<style>

</style>
