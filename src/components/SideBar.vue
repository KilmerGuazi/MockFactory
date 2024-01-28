<script setup>
import {ref} from 'vue'

const isCollapse = ref(false)

const clickToggleButton = () =>{
	isCollapse.value = isCollapse.value?false:true

	
}

</script>

<template>
	<el-aside :width="isCollapse?'64px':'225px'">
		<el-scrollbar >
			<el-menu router :default-active="$route.path" :collapse="isCollapse" :collapse-transition="false">
			<el-sub-menu index="1">
				<template #title>
					<el-icon><basketball/></el-icon>
					<span>我的</span>
				</template>
				<el-menu-item-group>
				<el-menu-item index="/Home/UserInfo">
					<el-icon><school/></el-icon>
					基本信息
				</el-menu-item>
				</el-menu-item-group>
			</el-sub-menu>
			<el-sub-menu index="2">
				<template #title>
					<el-icon><setting/></el-icon>
					<span>设置</span>
				</template>
			</el-sub-menu>
			<el-sub-menu index="3">
				<template #title>
					<el-icon><office-building /></el-icon>
					<span>项目</span>
				</template>
				<el-menu-item-group>
				<el-menu-item index="/Home/ProjectList">
					<el-icon><school /></el-icon>
					项目管理
				</el-menu-item>
				</el-menu-item-group>
			</el-sub-menu>
			<el-sub-menu index="4">
				<template #title>
					<el-icon><data-line /></el-icon>
					<span>数据源</span>
				</template>
				<el-menu-item-group>
				<el-menu-item index="/Home/DataSourceList">
					<el-icon><van /></el-icon>
					数据源管理
				</el-menu-item>
				</el-menu-item-group>
			</el-sub-menu>
			<el-sub-menu index="5">
				<template #title>
					<el-icon><van /></el-icon>
					<span>数据工人</span>
				</template>
				<el-menu-item-group>
				<el-menu-item index="/Home/VariableList">
					<el-icon><sugar /></el-icon>
					变量集
				</el-menu-item>
				<el-menu-item index="/Home/DataTemplateList">
					<el-icon><Coin /></el-icon>
					数据模板
				</el-menu-item>
				<el-menu-item index="/Home/MessageTemplateList">
					<el-icon><toilet-paper /></el-icon>
					消息模板
				</el-menu-item>
				<el-menu-item index="/Home/WorkerList">
					<el-icon><paperclip /></el-icon>
					工人管理
				</el-menu-item>
				<!-- <el-menu-item index="/Home/MakeWorker">
					<el-icon><money /></el-icon>
					工人制造
				</el-menu-item> -->
				</el-menu-item-group>
			</el-sub-menu>
			<el-sub-menu index="6">
				<template #title>
					<el-icon><smoking /></el-icon>
					<span>生产线</span>
				</template>
				<el-menu-item-group>
				<el-menu-item index="/Home/ProductLineList">
					<el-icon><scale-to-original /></el-icon>
					生产线管理
				</el-menu-item>
				<el-menu-item index="/Home/LaunchJobList">
					<el-icon><money /></el-icon>
					生产记录
				</el-menu-item>
				</el-menu-item-group>
			</el-sub-menu>
			</el-menu>
			<div class="toggle-button" @click="clickToggleButton">|||</div>
		</el-scrollbar>
	</el-aside>
</template>

<style>
/* .my-aside-style {
	overflow: auto;
	box-sizing: border-box;
    flex-shrink: 0;
} */
/* .el-aside {
    --el-aside-width: 225px;
} */
.el-container .el-menu {
	height: 95%;
}
.page-scroll {
	height: 100%;
}
.page-scroll .el-scrollbar__wrap {
overflow-x: hidden;

} 
.el-scrollbar__view {
	height: 100%;
}
.toggle-button{ 
	background-color: white; 
	font-size:10px; 
	line-height:24px;
	color:black; 
	text-align: center; 
	letter-spacing: 0.2em; 
	cursor:pointer;}
</style>
