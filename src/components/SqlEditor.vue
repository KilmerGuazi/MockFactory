<script setup>
import {ref,onMounted,reactive,h,provide,readonly, onUpdated, watch} from 'vue'
import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
import {CompletionContext,autocompletion,currentCompletions,completionStatus} from "@codemirror/autocomplete"
import {ViewUpdate} from "@codemirror/view"
import {queryAllVariables,queryVariableById,batchQueryVariableById} from '../http/commonRequest.js'
import {sql} from "@codemirror/lang-sql"
import _ from "lodash"
import {transferVariable2Schema,alterMsg,mockfactoryCommonAutoCompletions,mfSqlLanguageSupport} from '../common/common.js'
import { InvalidVariableIdError, QueryVariableError } from '../common/CustomerError.js'


// 定义组件的属性
const props = defineProps({
    content:String,
    variable:Array
})

// 定义组件的事件
const emit = defineEmits([
    'update:content'
])

const sqlEditorDiv = ref(null)
const sqlEditorBigDiv = ref(null)
const dialogShow = ref(false)
let sqlEditorView = ref(EditorView)
let sqlEditorBigView = ref(EditorView)
const sqlEditorBigDivStyle = ref({
    height:window.screen.availHeight/2 + 'px'
})
let sqlVariablesSchema = {}

const tipsContent = ref("请在这里输入你造数时所使用的sql语句，可以在sql语句中引用你设置的变量。")
const variable = ref()

/**
 * 创建codemirror的编辑器
 */
const createEditor = (big) => {
    let state = EditorState.create(
        {
            doc:props.content,
            extensions:
            [
                basicSetup,
                EditorView.lineWrapping,
                // autocompletion({override:[mockfactoryCommonAutoCompletions]}),
                // sql({schema:sqlVariablesSchema}),
                /**
                 * 拓展sql，加入自定义的代码提示
                 */
                mfSqlLanguageSupport(sqlVariablesSchema),
                /**
                 * 监听编辑器中的文本内容变更
                 */
                EditorView.updateListener.of((updateView)=>{
                    if(updateView.docChanged){
                        /**
                         * 文本内容发生变更
                         */
                        emit('update:content',updateView.state.doc.toString())
                    }
                })
            ]
        }
    );
    if(big){
        sqlEditorBigView.value = new EditorView({
            state:state,
            parent:sqlEditorBigDiv.value
        })
    }else{
        sqlEditorView.value = new EditorView({
            state:state,
            parent:sqlEditorDiv.value
        })
    }
} 

/**
 * 更新编辑器的Schema
 */
const updateEditorSchema = (v) =>{
    return new Promise((resolve,reject)=>{
        sqlVariablesSchema = {}
        v.forEach(element => {
             transferVariable2Schema(sqlVariablesSchema,element.name, JSON.parse(element.content))
        });
        resolve()
    })
}

/**
 * 删除已存在的Editor
 */
const destoryEditor = (big) =>{
    // 判断当前编辑器对象是否存在，如果存在则摧毁
    return new Promise((resolve,reject)=>{
        if(big){
            if(typeof sqlEditorBigView.value == 'object'){
                sqlEditorBigView.value.destroy()
            }
        }else{
            if (typeof sqlEditorView.value === 'object') {
                sqlEditorView.value.destroy()
            }
        }
        resolve()
    })
}

/**
 * 创建包含codemirror的编辑器视图
 */
const createSQLEditorView = (big) => {
    // queryVariableById(props.variable)
    batchQueryVariableById(props.variable)
    // 更新Schema
    .then(v=>{updateEditorSchema(v)})
    // 删除已有的编辑器
    .then(v=>{destoryEditor(big)})
    // 创建新的编辑器
    .then(v=>{createEditor(big)})
    // 捕获整个链路的异常
    .catch((error)=>{
        if(error instanceof InvalidVariableIdError){
            createEditor()
        }else if(error instanceof QueryVariableError){
            alterMsg(error.message,1)
        }else{
            console.log(error.message,error)
        }
    })
}

onMounted(()=>{
    // 创建SQL编辑器
    createSQLEditorView(false)
})

/**
 * 监听当前编辑器的变量是否改变
 * 如果改变则需要重新加载编辑器
 */
watch(()=>props.variable,(newValue,oldValue)=>{
    console.log("监听到变量发生变化，当前SQL编辑器重新记载",newValue,oldValue)
    createSQLEditorView()
})

/**
 * 点击放大编辑按钮事件
 */
const showBigEditorDialog =() =>{
    dialogShow.value = true
}

/**
 * 放大编辑器弹窗打开事件
 */
const bigEditorDialogOpened =()=>{
    sqlEditorBigDivStyle.value.height = window.screen.availHeight/100 * 80 + 'px'
    createSQLEditorView(true)
}

/**
 * 放大编辑器弹窗事件，
 * 关闭时，需要更新小编辑器中的内容
 */
const bigEditorDialogClose = () =>{
    sqlEditorView.value.dispatch({
        changes:{
            from:0,
            to:sqlEditorView.value.state.doc.toString().length,
            insert:sqlEditorBigView.value.state.doc.toString()
        }
    })
}
</script>

<template>
<!-- sql 编辑器 -->
<!--实际编写模板的元素-->
<div style="width:100%">
    <span>语句（SQL）:</span>
    <el-icon :size="15" color="#409EFC" class="no-inherit" @click="showBigEditorDialog">
        <Edit />
    </el-icon>
    <!-- sql编辑器-->
    <div ref='sqlEditorDiv' style="width: 100%;height: 250px;" ></div>
    <el-popover placement="bottom" :width="400" trigger="hover" :content="tipsContent">
        <template #reference>
            <el-icon><QuestionFilled /></el-icon>
        </template>
    </el-popover>   
</div> 
<!-- 放大编写弹窗 -->
<el-dialog v-model="dialogShow" title="SQL编辑窗口" destroy-on-close=true fullscreen width="90%" @opened="bigEditorDialogOpened" @close="bigEditorDialogClose" >
    <div ref='sqlEditorBigDiv' :style="sqlEditorBigDivStyle">

    </div>
</el-dialog>
</template>

<style>
.cm-editor {
    height: 100%;
    width: 100%;
}
.el-collapse-item__content {
    padding-bottom: 0px;
}
</style>
