import axios from '../http/axios'
import {InvalidVariableIdError,QueryVariableError} from '../common/CustomerError'

// 查询所有用户
const queryAllUser = (cb) =>{
	axios.get('/mock/user/list').then(res=>{
		cb(res)
	})
}

// 查询所有项目
const queryAllProject = (pageSize,currentPage,condition,cb) =>{
	axios.post('/mock/project/query',{pageSize:pageSize,currentPage:currentPage,condition:condition}).then(res=>{
		cb(res)
	})
}

// 查询所有变量
const queryAllVariables = (pageSize,currentPage,condition,cb) =>{
	axios.post('/mock/variables/query',{pageSize:pageSize,currentPage:currentPage,condition:condition}).then(res=>{
		cb(res)
	})
}


// 根据id查询单个变量，
const queryVariableById = (id) =>{
	return new Promise((resolve,reject)=>{
		if(id === null){
			reject (new InvalidVariableIdError())
		}
		axios.post('/mock/variables/query',{pageSize:10,currentPage:1,condition:{id:id}}).then(res=>{
			if(res.status === 200 && res.data.status === 10000 ){
				resolve(res.data.data[0])
			}else{
				reject(new QueryVariableError('拉取对应变量数据异常！'))
			}
		})
	})
} 

// 根据id批量查询多个变量
const batchQueryVariableById = (ids) =>{
	return new Promise((resolve,reject)=>{
		if(ids === null){
			reject (new InvalidVariableIdError())
		}
		axios.post('/mock/variables/batchQuery',{ids:ids}).then(res=>{
			if(res.status === 200 && res.data.status === 10000 ){
				resolve(res.data.data)
			}else{
				reject(new QueryVariableError('拉取对应变量数据异常！'))
			}
		})
	})
} 

// 查询数据源
const queryAllDataSource = (pageSize,currentPage,condition,cb) => {
	axios.post('/mock/datasource/query',{pageSize:pageSize,currentPage:currentPage,condition:condition}).then(res=>{
		cb(res)
	})
}

// 查询工人
const queryAllWorker = (pageSize,currentPage,condition,cb) => {
	axios.post('/mock/worker/query',{pageSize:pageSize,currentPage:currentPage,condition:condition}).then(res=>{
		cb(res)
	})
}

// 查询生产线
const queryAllProductLine = (pageSize,currentPage,condition,cb) => {
	axios.post('/mock/productLine/query',{pageSize:pageSize,currentPage:currentPage,condition:condition}).then(res=>{
		cb(res)
	})
}

// 查询任务
const queryAllLaunchJob = (pageSize,currentPage,condition,cb) => {
	axios.post('/mock/launchJob/query',{pageSize:pageSize,currentPage:currentPage,condition:condition}).then(res=>{
		cb(res)
	})
}

// 查询消息模板
const queryAllMsgTemplate = (pageSize,currentPage,condition,cb) => {
	axios.post('/mock/msgtemplate/query',{pageSize:pageSize,currentPage:currentPage,condition:condition}).then(res=>{
		cb(res)
	})
}

// 查询消息树
const queryMsgTree = (cb) =>{
	axios.get('/mock/messagetree/query').then(res=>{
		cb(res)
	})
}

// 查询消息树中某节点的路径
const queryNodePathInMsgTree = (node_id,cb) =>{
	axios.post ('/mock/messagetree/getNodePath',{node_id:node_id},cb).then(res=>{
		cb(res)
	})
}

/**
 * 查询所有数据模板
 */
const queryDataTemplate = (pageSize,currentPage,condition,cb) =>{
	axios.post('/mock/template/data/query',{pageSize:pageSize,currentPage:currentPage,condition:condition}).then(res=>{
		cb(res)
	})
}

export {
	queryAllUser,
	queryAllProject,
	queryAllVariables,
	queryVariableById,
	batchQueryVariableById,
	queryAllDataSource,
	queryAllWorker,
	queryAllProductLine,
	queryAllLaunchJob,
	queryAllMsgTemplate,
	queryMsgTree,
	queryNodePathInMsgTree,
	queryDataTemplate
}