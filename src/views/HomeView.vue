<script setup>
import Sidebar from "../components/SideBar.vue"
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";

const router = useRouter()
const store = useStore()
let userName = localStorage.getItem('user.name')

// 退出登录
const logout = () => {
	store.commit('logout')
	// 跳转到登陆页面
	router.replace('/Login')
}
</script>

<template>
  <el-container>
    <el-header style="height: 100px;">
      <el-row>
        <el-col :span="4">
             <el-image class="header-common" :src="require('@/assets/logo_home.png')" :fit="fill"></el-image>
        </el-col>
        <el-col :span="4" :offset="16" style="display: flex;align-items: center;">
          <el-avatar>user</el-avatar>
			<el-dropdown style="margin-left: 10px;">
				<span class="el-dropdown-link">
					{{userName}}
					<el-icon class="el-icon--right"><arrow-down /></el-icon>
				</span>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item @click='logout'>退出登录</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
		<!--侧边栏-->
		<Sidebar></Sidebar>
		<!--首页子路由界面-->
		<router-view></router-view>
    </el-container>
  </el-container>
</template>

<style>
  .el-container,.el-menu{
        padding: 0px;
        margin: 0px;
        height: 100%;
        overflow-y: hidden;
  }

header-common{
  width: 230px;
  height: 100%;
}

  

</style>
