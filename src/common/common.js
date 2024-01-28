import {ref} from 'vue'
import {ElMessage,ElMessageBox} from 'element-plus'
import {sql} from "@codemirror/lang-sql"
import {json} from "@codemirror/lang-json"
import {completeFromList} from "@codemirror/autocomplete"
import {LanguageSupport} from "@codemirror/language"

const pageSize = ref(15)

// 工人类型
const workerType = [
	{
		name:'SQL',
		value:1
	},
	{
		name:'规则',
		value:2
	},
	{
		name:'接口',
		value:3
	},
	{
		name:'混合',
		value:4
	}
]

// 变量集类型
const variableType = [
	{
		name:'JSON',
		value:1
	},
	// {
	// 	name:'XML',
	// 	value:2
	// }
]

// 数据源类型
const datasourceType = [
	{
		name:'MYSQL',
		value:1
	},
	{
		name:'CLICKHOUSE',
		value:2
	},
	{
		name:'REDIS',
		value:3
	},
	{
		name:'KAFKA',
		value:4
	},
	{
		name:'MQ',
		value:5
	},
	{
		name:'INTERFACE',
		value:6
	}
]

// 消息类型
const messageType = [
	{
		name:'JSON',
		value:1
	}
]

// 根据value获取数据源的name
const getDataSourceType=(value)=>{
	let tmp = datasourceType.filter(item=>{return item.value === value})
	return tmp[0].name
}

// 将变量集的字符串id数组转换成整形id数组
const transferVariableIdsStr2Int = (ids) =>{
	if(ids === ''){
		return []
	}
	let strIdsArray = ids.split(",")
	let intIdsArray = []
	strIdsArray.forEach((data)=>{
		intIdsArray.push(Number(data))
	})
	return intIdsArray
}

// 消息提示
const alterMsg=(msg,type)=>{
	let typeMsg = 'success'
	if(type === 0){
		typeMsg = 'success'
	}else{
		typeMsg = 'error'
	}
	ElMessage({
	    message: msg,
	    type: typeMsg,
	})
}

// 消息确认提示
const alterConfirmBox = (title,msg,ok) =>{
	ElMessageBox.confirm(
	    msg,
	    title,
	    {
	      confirmButtonText: '确认',
	      cancelButtonText: '取消',
	      type: 'warning',
	    }
	  )
	    .then(() => {
			ok()
	    })
	    .catch(() => {
	      console.log('取消')
	    })
}

const transferVariable2Schema = (schema,parentKey,value) =>{
	if (!schema.hasOwnProperty(parentKey)) schema[parentKey]=[]
	let allKey = Object.keys(value)
	allKey.forEach((key,index)=>{
		schema[parentKey].indexOf(key) === -1?schema[parentKey].push(key):''
		let tmpValue = value[key] 
		if(Object.prototype.toString.call(tmpValue)==='[object Array]'){
			// json array
			tmpValue.forEach((tmp,index)=>{
				transferVariable2Schema(schema,key,tmp)
			})
		}else if(Object.prototype.toString.call(tmpValue)==='[object Object]'){
			// json object:递归查找
			transferVariable2Schema(schema,key,tmpValue)
		}else{
			// other:不处理
		}
	})
}

// 造数工厂编辑器通用代码提示
const mockfactoryCommonAutoCompletions = (context) =>{
  let word = context.matchBefore(/\w*/)
  if (word.from == word.to && !context.explicit)
    return null
  return {
    from: word.from,
    options: [
	  {label: "mf_current_timestamp_s",type:"variable",apply:'"${mf_current_time_s}"',detail:"当前时间戳（秒）"},
	  {label: "mf_current_timestamp_ms",type:"variable",apply:'"${mf_current_time_ms}"',detail:"当前时间戳（毫秒）"},
	  {label: "mf_current_time",type:"variable",apply:'"${mf_current_time}"',detail:"当前时间（年-月-日 时:分:秒）"},
	  {label: "mf_f_get_time",type:"function",apply:'"${mf.get_time(1,0,0,0)}"',detail:"动态计算时间偏移，参数1：在当天基础上的天数偏移，参数2：小时，参数3：分钟，参数4：秒。返回（年-月-日 时:分:秒）"},
	  {label: "mf_f_get_timestamp_s",type:"function",apply:'"${mf.get_timestamp_s(1,0,0,0)}"',detail:"动态计算时间偏移，参数1：在当天基础上的天数偏移，参数2：小时，参数3：分钟，参数4：秒。返回秒级时间戳"},
	  {label: "mf_f_get_timestamp_ms",type:"function",apply:'"${mf.get_timestamp_ms(1,0,0,0)}"',detail:"动态计算时间偏移，参数1：在当天基础上的天数偏移，参数2：小时，参数3：分钟，参数4：秒。返回毫秒级时间戳"}
    ]
  }
}

// 自定义mysql语法
const mfSqlLanguageSupport = (schema) => {
	let sqlSupport = sql({schema:schema})
	let mfSqlLanguage = sql().language
	let mfSqlCompletion = mfSqlLanguage.data.of({
		autocomplete: completeFromList([
			{label: "mf_current_timestamp_s",type:"variable",apply:'"${mf_current_time_s}"',detail:"当前时间戳（秒）"},
			{label: "mf_current_timestamp_ms",type:"variable",apply:'"${mf_current_time_ms}"',detail:"当前时间戳（毫秒）"},
			{label: "mf_current_time",type:"variable",apply:'"${mf_current_time}"',detail:"当前时间（年-月-日 时:分:秒）"},
			{label: "mf_f_get_time",type:"function",apply:'"${mf.get_time(1,0,0,0)}"',detail:"动态计算时间偏移，参数1：在当天基础上的天数偏移，参数2：小时，参数3：分钟，参数4：秒。返回（年-月-日 时:分:秒）"},
			{label: "mf_f_get_timestamp_s",type:"function",apply:'"${mf.get_timestamp_s(1,0,0,0)}"',detail:"动态计算时间偏移，参数1：在当天基础上的天数偏移，参数2：小时，参数3：分钟，参数4：秒。返回秒级时间戳"},
			{label: "mf_f_get_timestamp_ms",type:"function",apply:'"${mf.get_timestamp_ms(1,0,0,0)}"',detail:"动态计算时间偏移，参数1：在当天基础上的天数偏移，参数2：小时，参数3：分钟，参数4：秒。返回毫秒级时间戳"}
		])
	  })
  	return new LanguageSupport(mfSqlLanguage, [sqlSupport.extension,mfSqlCompletion])
}

/**
 * 自定义json语法
 */
const mfJsonLanguageSupport = () => {
	let jsonSupport = json()
	let mfJsonLanguage = json().language
	let mfJsonCompletion = mfJsonLanguage.data.of({
		autocomplete:completeFromList([
			{label:"mf_f_random_choose",type:"function",apply:'"${mf.random_choose([exp1,exp2])}"',detail:"随机选择参数中的一个作为返回值"},
			{label:"mf_f_date2timestamp",type:"function",apply:'"${mf.date2timestamp(xxxx-xx-xx xx:xx:xx)}"',detail:"日期转毫秒级别的时间戳"},
			{label:"mf_f_dateOffset",type:"function",apply:'"${mf.dateOffset(1,0,0,0)}"',detail:"动态计算时间偏移，参数1：在当天基础上的天数偏移，参数2：小时，参数3：分钟，参数4：秒，返回格式为2022-12-15 00:00:00的日期字符串"}
		])
	})
	return new LanguageSupport(mfJsonLanguage,[jsonSupport.extension,mfJsonCompletion])
}


/**
 * 获取uuid
 */
 const guid =() =>{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


// 表格通用样式
const commonTableRowStyle = ({ row, rowIndex }) =>{
	return  'height:50px';
}


export {
	pageSize,
	workerType,
	variableType,
	datasourceType,
	transferVariableIdsStr2Int,
	alterMsg,
	alterConfirmBox,
	transferVariable2Schema,
	messageType,
	getDataSourceType,
	mockfactoryCommonAutoCompletions,
	commonTableRowStyle,
	guid,
	mfSqlLanguageSupport,
	mfJsonLanguageSupport
}