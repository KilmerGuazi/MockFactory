<script setup>
import {ref,reactive} from "vue";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import { ElMessage } from 'element-plus'
import axios from '../http/axios'

const store = useStore()
const route = useRoute()
const router = useRouter()
const loginTab = ref(null)
const loginForm = ref(null)
const signinForm = ref(null)
const user = ref({
  email: '',
  password: ''
})
const signinUser = reactive({
	name:'',
	password:'',
	email:''
})

// 登陆请求
const loginRequest = (u) => {
	axios.post("/mock/user/login",u).then(res =>{
		console.log(res)
		if(res.status === 200 && res.data.status === 10000){
			store.commit("changeLogin","TestToken")
			store.commit("updateUserInfo",(res.data.data)[0])
			ElMessage({
				message: res.data.msg,
				type: 'success',
			})
			// 路由跳转
			if(route.query.redirect){
				// 跳转到重定向页面
				let redirect = route.query.redirect
				router.replace(redirect)
			}
			else{
				// 跳转到主页面
				router.replace('/Home')
			}
		}
		else{
			ElMessage.error(res.data.msg)
		}
	})
}
// 登陆事件
const login = () => {
	loginForm['value'].validate(async (valid) => {
	  if (valid) {
		  await loginRequest(user.value)
	  }
	})
}
// 注册事件
const signin = () =>{
	signinForm['value'].validate(async (valid) =>{
		if (valid){
			console.log('表单验证成功')
			// 请求注册用户
			console.log(signinUser)
			await axios.post("/mock/user/signin",signinUser).then(res => {
				console.log(res)
				if(res.status === 200 && res.data.status === 10000){
					// 注册成功
					ElMessage({
						message: res.data.msg,
						type: 'success',
					})
					// 自动登陆
					loginRequest({email:signinUser.email,password:signinUser.password})
				}else{
					// 注册失败
					ElMessage.error(res.data.msg)
				}
			})
		}
	})
}
// 自定义邮箱校验规则
const validateEmail = (rule, value, callback) => {
	if (value === '' || !/^[\w.\-]+@(?:[a-z0-9]+(?:-[a-z0-9]+)*\.)+[a-z]{2,3}$/.test(value)){
		callback(new Error('请输入正确的邮箱'))
	}else{
		callback()
	}
}
// 注册规则检查
const rules = reactive({
	email:[
		{
			validator:validateEmail,
			trigger: 'blur'
		}
	],
	password:[
		{
			required:true,
			message:'请输入密码!',
			trigger: 'blur'
		}
	],
	name:[
		{
			required:true,
			message:'请输入账户名',
			trigger: 'blur'
		}
	]
})

</script>

<template>
	<div class="login">
		<el-card shadow="always" style="width: 550px;"  body-style="background-color:#FFFFFF;text-align:center;position:relative">
		<img
		  src="../assets/logo.png"
		  class="image"
		/>
		<el-tabs model-value="login">
			<el-tab-pane label="登陆" name="login">
				<el-form ref="loginForm" :model="user" :rules="rules">
					<el-form-item prop="email">
						<el-input prefix-icon="user-filled" v-model="user.email" placeholder="账户邮箱" />
					</el-form-item>
					<el-form-item prop="password">
						<el-input prefix-icon="lock" v-model="user.password" placeholder="密码" type="password" show-password/>
					</el-form-item>
					<el-button type="primary" @click="login">登陆</el-button>
				</el-form>
			</el-tab-pane>
			<el-tab-pane label="注册" name="signin">
				<el-form ref="signinForm" :model="signinUser" :rules="rules">
					<el-form-item prop="email">
						<el-input prefix-icon="eleme" v-model="signinUser.email" placeholder="邮箱"/>
					</el-form-item>
					<el-form-item prop="name">
						<el-input prefix-icon="user-filled" v-model="signinUser.name" placeholder="账户" />
					</el-form-item>
					<el-form-item prop="password">
						<el-input prefix-icon="lock" v-model="signinUser.password" placeholder="密码" type="password" show-password/>
					</el-form-item>
					<el-button type="warning" @click="signin">注册</el-button>
				</el-form>
			</el-tab-pane>
		</el-tabs>
		</el-card>
	</div>
</template>

<style>
	.login {
	    position: fixed;
	    height: 100%;
	    width: 100%;
	    background-position: left bottom;
	    display: flex;
	    align-items: center;
	    justify-content: center;
	}
</style>
