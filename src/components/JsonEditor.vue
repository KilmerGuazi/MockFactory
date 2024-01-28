<script setup>
import {ref,onMounted,reactive,h,provide,readonly, onUpdated, watch} from 'vue'
import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
import {ViewUpdate} from "@codemirror/view"
import {json} from "@codemirror/lang-json"
import {mfJsonLanguageSupport} from '../common/common.js'

// 定义组件的属性
const props = defineProps({
    index:Number,
    content:String,
    tips:String,
    title:String,
    divStyle:String // 由父组件指定当前editor div的样式
})

// 定义组件的事件
const emit = defineEmits([
    'update:content'
])

const jsonEditorDiv = ref(null)
const jsonEditorBigDiv = ref(null)
const dialogShow = ref(false)
let jsonEditorView = ref(EditorView)
let jsonEditorBigView = ref(EditorView)
const jsonEditorBigDivStyle = ref({
    height:window.screen.availHeight/2 + 'px'
})

/**
 * 创建JSON编辑器
 */
const createJsonEditor =(doc, big)=>{
	let state = EditorState.create({
		doc:props.content,
		extensions:[
			basicSetup,
            mfJsonLanguageSupport(),
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
        ],
		})
    if(!big){
        jsonEditorView.value = new EditorView({
            state:state,
            parent:jsonEditorDiv.value,
        })
    }else{
        jsonEditorBigView = new EditorView({
            state:state,
            parent:jsonEditorBigDiv.value
        })
    }
}

onMounted(()=>{
    // 创建json编辑器
    createJsonEditor(props.content,false)
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
    jsonEditorBigDivStyle.value.height = window.screen.availHeight/100 * 80 + 'px'
    createJsonEditor(props.content,true)
}

/**
 * 放大编辑器弹窗事件，
 * 关闭时，需要更新小编辑器中的内容
 */
const bigEditorDialogClose = () =>{
    jsonEditorView.value.dispatch({
        changes:{
            from:0,
            to:jsonEditorView.value.state.doc.toString().length,
            insert:jsonEditorBigView.state.doc.toString()
        }
    })
}
</script>

<template>
<!-- json 编辑器 -->
<!--实际编写模板的元素-->
<div style="width:100%">
    <span>{{title}}</span>
    <el-icon :size="15" color="#409EFC" class="no-inherit" @click="showBigEditorDialog">
        <Edit />
    </el-icon>
    <!-- json编辑器-->
    <div :style=divStyle ref='jsonEditorDiv' ></div>
    <!--提示信息-->
    <el-popover placement="bottom" :width="400" trigger="hover" :content=tips>
        <template #reference>
            <el-icon><QuestionFilled /></el-icon>
        </template>
    </el-popover>   
</div>
<!-- 放大编写弹窗 -->
<el-dialog v-model="dialogShow" title="JSON编辑窗口" destroy-on-close=true fullscreen width="90%" @opened="bigEditorDialogOpened" @close="bigEditorDialogClose" >
    <div ref='jsonEditorBigDiv' :style="jsonEditorBigDivStyle">

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
