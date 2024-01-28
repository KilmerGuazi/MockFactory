import { createApp} from 'vue';
import App from './App.vue';
import router from '../router/index.js';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElIcons from '@element-plus/icons';
import store from './store/index.js'
import contextmenu from 'vue3-contextmenu'
import 'vue3-contextmenu/dist/vue3-contextmenu.css'


// 创建vue app应用
const app = createApp(App)
// 全局注册icon
for(const name in ElIcons){
	app.component(name, ElIcons[name]);
}

// 使用自定义路由和element plus,并且挂在vue app
app.use(router).use(ElementPlus).use(store).use(contextmenu)
app.mount('#app');

router.beforeEach((to, from, next) => {
	console.log(to.fullPath)
	// token不存在时，重新发起登陆
	if (store.state.token.length === 0 && to.path !=='/Login'){
		console.log('mockDataToken不存在重新登录')
		next({
		    path: '/Login',
		    query: { redirect:'/Home' }
		})
	}
	else {
		next()
	}
})