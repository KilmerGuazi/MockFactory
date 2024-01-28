import {createStore} from 'vuex'

export default createStore({
	state() {
		return {
			userInfo:{},
			token: localStorage.getItem('mockDataToken') ? localStorage.getItem('mockDataToken') : ''
		}
	},
	mutations:{
		changeLogin(state, mockDataToken) {
		    state.token = mockDataToken;
		    localStorage.setItem('mockDataToken', mockDataToken);
		},
		updateUserInfo(state,user) {
			state.userInfo = user
			localStorage.setItem('user.name',user.name)
			localStorage.setItem('user.email',user.email)
			localStorage.setItem('user.id',user.id)
		},
		logout(state) {
			state.userInfo = {}
			state.token = ''
			localStorage.removeItem('mockDataToken')
			localStorage.removeItem('user.name')
			localStorage.removeItem('user.email')
			localStorage.removeItem('user.id')
		}
	}
})