<script setup>
// 导入依赖
import {ref,onMounted,reactive,h,provide,readonly, toRef} from 'vue'
import {commonTableRowStyle,guid,alterMsg,pageSize}  from '../common/common.js'
import {queryAllProject,queryAllUser,queryAllVariables,queryAllDataSource,queryDataTemplate} from '../http/commonRequest.js'
import SqlEditor from "../components/SqlEditor.vue"
import JsonEditor from '@/components/JsonEditor.vue'
import axios from '../http/axios'

//变量定义
const creators = ref([])
const projects = ref([])
const variables = ref([])
const dataSources = ref([])
const dataTemplates = ref([])
const currentPage = ref(1) // 分页当前页数
const total = ref(0) // 总数
const createDataTemplateDrawer = ref(null)
const isDrawerOpen = ref(false)
const drawerTitle = ref("新建")
const activeNames = ref([1])
const saveDataTemplateForm = ref(null)
const jsonEditorTitle = ref("上下文（JSON）")
const jsonEditorTips = ref("请以json的格式填写上下文！")
const jsonEditorDivStyle = ref({
	width:'100%',
	height:'250px'
})

/**
 * 查询数据体
 */
const queryTemplateData = reactive({
    'name':'',
    'creator':''
})

/**
 * 新建数据体
 */
const createTemplateData = ref(
    {
        id:null,
        name:null,
        project:{
            id:null
        },
        creator:localStorage.getItem('user.name'),
        detail:[
            {
                id:null,
                order:1,
                datasource:{
                    id:null
                },
                variable:[],
                content:null,
                context:null,
                comment:null
            }
        ]
    }
)

/**
 * 新建数据体原始数据
 */
const createTemplateSourceData = ref(
    {
        id:null,
        name:null,
        project:{
            id:null
        },
        creator:localStorage.getItem('user.name'),
        detail:[
            {
                id:null,
                order:1,
                datasource:{
                    id:null
                },
                db:'',
                variable:[],
                content:null,
                context:null,
                comment:null
            }
        ]
    }
)


// 点击创建数据模板按钮事件
const createDataTemplate = () =>{
    // 打开侧边栏
    isDrawerOpen.value = true
    drawerTitle.value = "新建"
}

/**
 * 添加sql编辑器
 */
const addEditor = (index) => {
    var newEditorIndex = index + 1
    activeNames.value.push(newEditorIndex)
    // 指定位置插入sql编辑器
    createTemplateData.value.detail.splice(index + 1,0, {
        id:null,
        order:newEditorIndex,
        datasource:{
            id:null
        },
        variable:[],
        content:null,
        context:null,
        comment:null
    })
    // 重置顺序
    createTemplateData.value.detail.forEach((item,index)=>{
        item.order = index+1
    })
}

/**
 * 删除sql编辑器
 */
const deleteEditor =(index) =>{
    // 判断当前编辑器是否只有一个，只有一个时不允许删除
    if(createTemplateData.value.detail.length <=1){
        alterMsg('只有一个编辑器啦，不允许删除',1)
        return
    }
    // 删除指定的sql编辑器
    createTemplateData.value.detail.splice(index,1)
    createTemplateData.value.detail.forEach((item,index)=>{
        item.order = index+1
    })
}

/**
 * 保存数据模板
 */
const save = () =>{
    //表单验证
    saveDataTemplateForm.value.validate(async(valid)=>{
        if(valid){
            await axios.post('/mock/template/data/save',createTemplateData.value).then(res=>{
                if(res.status === 200 && res.data.status === 10000){
                    alterMsg('保存数据模板成功',0)
                    // 关闭抽屉
                    isDrawerOpen.value = false
                    // 查询所有数据模板
                    queryDataTemplate(pageSize.value,1,{},(res)=>{
                        if(res.status === 200 && res.data.status === 10000){
                            dataTemplates.value = res.data.data
                            total.value = res.data.total
                        }
                    })
                }else{
                    alterMsg('保存数据模板失败:' + res.data.msg,1)
                }
            })
        }
    })
}

/**
 * 取消保存
 */
const cancel = () =>{
    isDrawerOpen.value = false
}

/**
 * 分页发生改变事件
 */
const currentPageChange = () =>{
	queryDataTemplate(pageSize.value,currentPage.value,queryTemplateData,(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			dataTemplates.value = res.data.data
			total.value = res.data.total
		}else{
			alterMsg('查询模板失败',-1)
		}
	})
}

/**
 * 条件查询
 */
const queryByCondition = () =>{
    queryDataTemplate(pageSize.value,currentPage.value,queryTemplateData,(res)=>{
        if(res.status === 200 && res.data.status === 10000){
			dataTemplates.value = res.data.data
            total.value = res.data.total
		}
    })
}

/**
 * 编辑模板事件
 */
const editTemplate = (data) => {
    // 变更数据
    isDrawerOpen.value = true
    drawerTitle.value = "编辑"
    createTemplateData.value = data
}

/**
 * 复制模板
 */
const copyTemplate = (data) =>{
    data.id = null
    data.name = data.name + '.copy.' + new Date().getTime()
    delete data.create_time
    delete data.update_time
    data.detail.forEach((element) =>{
        element.id = null
    })
    axios.post('/mock/template/data/save',data).then(res=>{
    if(res.status === 200 && res.data.status === 10000){
        alterMsg('复制数据模板成功',0)
        // 查询所有数据模板
        queryDataTemplate(pageSize.value,1,{},(res)=>{
            if(res.status === 200 && res.data.status === 10000){
                dataTemplates.value = res.data.data
                total.value = res.data.total
            }
        })
    }else{
        alterMsg('复制数据模板失败:' + res.data.msg,1)
    }
})
}

/**
 * 删除模板事件
 */
const deleteTemplate = (id) =>{

}


// 页面加载时的处理
onMounted (()=>{
    // 查询所有数据模板
    queryDataTemplate(pageSize.value,1,{},(res)=>{
        if(res.status === 200 && res.data.status === 10000){
			dataTemplates.value = res.data.data
            total.value = res.data.total
		}
    })

    // 查询所有用户
	queryAllUser((res)=>{
		creators.value = res.data.data
	})

    // 查询所有项目
    queryAllProject(10000,1,{},(res)=>{
		if(res.status === 200 && res.data.status === 10000){
			projects.value = res.data.data
		}
	})

    // 查询所有变量
    queryAllVariables(10000,1,{},(res)=>{
        if(res.status === 200 && res.data.status === 10000){
			variables.value = res.data.data
		}
    })
    
    // 查询所有数据源
    queryAllDataSource(10000,1,{},(res)=>{
         if(res.status === 200 && res.data.status === 10000){
			dataSources.value = res.data.data
		}
    })
})

/**
 * 抽屉关闭事件
 */
const drawerClosed = () =>{
    // 清空数据
    createTemplateData.value = createTemplateSourceData.value
}

/**
 * 自定义保存数据模板时对语句的校验
 */
const validateTemplateStatement = (rule,value,callback) =>{
    if(value===undefined||value===''||value===null){
        callback(new Error("请设置语句"))
    }
    return true
}

const clearVariable = (index) =>{
    createTemplateData.value.detail[index].variable.id = null
}

/**
 * 表单验证规则
 */
const rules = reactive({
	name:[
		{
			required:true,
			message:'请设置数据模板的名称',
			trigger: 'blur'
		}
	],
    project:[
        {
			required:true,
			message:'请选择项目',
			trigger: 'blur'
		}
    ],
    comment:[
        {
			required:true,
			message:'请输入备注说明信息',
			trigger: 'blur'
		}
    ],
    dataSource:[
         {
			required:true,
			message:'请选择数据源',
			trigger: 'blur'
		}
    ],
    db:[
         {
			required:true,
			message:'请输入数据库名称',
			trigger: 'blur'
		}
    ],
    templateStatements:[
        {
            validator:validateTemplateStatement,
            trigger:'blur'
        }
    ]
})
</script>

<template>
    <!-- container 布局 -->
    <el-container style="height: 100%;width: 100%;">
        <!-- header 布局 -->
        <el-header>
            <!-- 查询表单-->
            <el-form :inline="true" :model="queryTemplateData">
                <!-- 查询项：数据模板名称 -->
                <el-form-item label="数据模板名称">
					<el-input v-model="queryTemplateData.name" clearable=""></el-input>
				</el-form-item>
                <!-- 查询项：数据模板创建人 -->
                <el-form-item label="创建人">
				  <el-select v-model="queryTemplateData.creator" filterable :multiple="false" clearable>
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
                    <el-button type="primary" @click="createDataTemplate">新建</el-button>
            </el-form-item>
            </el-form>
        </el-header>
        <!-- main 布局 -->
        <el-main>
            <!-- 数据模板列表 -->
            <el-table :data="dataTemplates" :row-style="commonTableRowStyle" :header-cell-style="{background:'#f0f4ff'}" style="width: 100%; " stripe border>
              <el-table-column prop="id" label="id" align="center"></el-table-column>
              <el-table-column prop="name" label="名称" align="center"></el-table-column>
              <el-table-column prop="project.name" label="项目" align="center">
                <template #default="scope">
					<el-tag type="success">{{scope.row.project.name}}</el-tag>
				</template>
              </el-table-column>
              <el-table-column prop="creator" label="创建人" align="center"></el-table-column>
              <el-table-column prop="create_time" label="创建时间" align="center"></el-table-column>
              <el-table-column prop="update_time" label="更新时间" align="center" ></el-table-column>
              <el-table-column label="操作" align="center" >
                <template #default="scope">
                    <el-popconfirm title="你确认要复制此模板吗?" confirmButtonText='确认' cancelButtonText='取消' @confirm="copyTemplate(scope.row)">
					    <template #reference>
							<el-button type="text" size="small">复制</el-button>
						</template>
				    </el-popconfirm>
                    <el-button type="text" size="small" @click="editTemplate(scope.row)">编辑</el-button>
                    <el-popconfirm title="你确认要删除此模板吗?" confirmButtonText='确认' cancelButtonText='取消' @confirm="deleteTemplate(scope.row.id)">
					    <template #reference>
							<el-button type="text" size="small">删除</el-button>
						</template>
				    </el-popconfirm>
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
    <!--创建数据模板的抽屉 -->
    <el-drawer ref="createDataTemplateDrawer" :title="drawerTitle" v-model="isDrawerOpen" :destroy-on-close = "true" size="90%" direction="ttb" @closed="drawerClosed">
        <el-main class="data-template-drawer-main">
            <!-- 创建数据模板的表单 -->
            <el-form ref="saveDataTemplateForm" :model="createTemplateData">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <!-- 模板名称输入框 -->
                    <el-form-item label="名称:" prop="name" :rules="rules.name">
                        <el-input v-model="createTemplateData.name" maxlength="50"  show-word-limit/>
                    </el-form-item>
                  </el-col>
                   <el-col :span="12">
                    <!-- 模板所属项目-->
                    <el-form-item label="项目:" prop="project.id" :rules="rules.project">
                        <el-select v-model="createTemplateData.project.id" filterable :multiple="false" style="width: 100%;" placeholder="请选择项目">
                            <el-option
                            v-for="tmp in projects"
                            :key="tmp.name"
                            :label="tmp.name"
                            :value="tmp.id"
                            >
                            </el-option>
                        </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <!-- 模板对应的相关内容 -->
                <el-collapse v-model="activeNames" style="width:100%">
                    <el-collapse-item v-for="(data,index) in createTemplateData.detail"  :name="data.order" :title="'#' + data.order" style="width:100%" :key="guid()">
                        <el-row :gutter="20">
                            <el-col :span="6">
                                <!--备注-->
                                <el-form-item label="备注" :prop="'detail.' + index + '.comment'"  :rules="rules.comment">
                                    <el-input  v-model="data.comment" placeholder="请在这里输入备注说明信息" maxlength="30" show-word-limit></el-input>
                                </el-form-item>
                            </el-col>
                             <el-col :span="6">
                                <!--数据源-->
                                <el-form-item label="数据源" :prop="'detail.' + index + '.datasource.id'"  :rules="rules.dataSource">
                                    <el-select v-model="data.datasource.id" filterable :multiple="false" placeholder="请设置数据源" style="width: 100%;">
                                        <el-option
                                        v-for="tmp in dataSources"
                                        :key="tmp.name"
                                        :label="tmp.name"
                                        :value="tmp.id"
                                        >
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <!--db-->
                                <el-form-item label="DB" :prop="'detail.' + index + '.db'"  :rules="rules.db">
                                    <el-input  v-model="data.db" placeholder="请在这里输入数据库名称" maxlength="30" show-word-limit></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <!--变量-->
                                <el-form-item label="变量" >
                                    <el-select v-model="data.variable" filterable multiple placeholder="请设置变量" style="width: 100%;" clearable @clear="clearVariable(index)">
                                        <el-option
                                        v-for="tmp in variables"
                                        :key="tmp.name"
                                        :label="tmp.name"
                                        :value="tmp.id"
                                        >
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="10">
                          <el-col :span="12">
                            <!--语句-->
                            <el-form-item  :prop="'detail.' + index + '.content'" :rules="rules.templateStatements" >
                                <SqlEditor  v-model:content="data.content" :variable="data.variable"></SqlEditor>
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                            <!--上下文-->
                            <el-form-item :prop="'detail.' + index + '.context'">
                                <JsonEditor v-model:content="data.context" :title=jsonEditorTitle :tips=jsonEditorTips :divStyle=jsonEditorDivStyle></JsonEditor>
                            </el-form-item>
                          </el-col>
                        </el-row>
                        <!-- 删除编辑器按钮 -->
                        <el-button size="small" type="danger" icon="Delete" circle @click="deleteEditor(index)"/>
                        <!-- 添加编辑器按钮 -->
                        <el-button size="small" type="primary" icon="Plus" circle @click="addEditor(index)"/>
                    </el-collapse-item>
                </el-collapse>
            </el-form>
            <div class="saveCancelButtonDiv">
                <el-button type="primary" @click="save" >保存</el-button>
                <el-button type="primary" @click="cancel" style="margin-right:10px;">取消</el-button>
            </div>
        </el-main>
    </el-drawer>
</template>

<style scope="">
.saveCancelButtonDiv {
    display: flex;
    flex-direction: row-reverse;
    margin-top: 10px;
}

.data-template-drawer-main {
    --el-main-padding:10px;
    width:100%;
    height:100%;
}
</style>