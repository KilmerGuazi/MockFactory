import axios from 'axios'

const serverBaseUrl = {
	local:"http://localhost:9999",
	test:"",
	dev:"",
	prod:""
}

let baseURL=''
let currentEnv = window.process?.env?.ENV
switch(currentEnv)
{
	case "local":
		baseURL = serverBaseUrl.local
		break
	case "test":
		baseURL = serverBaseUrl.test
		break
	case "dev":
		baseURL = serverBaseUrl.dev
		break
	case "prod":
		baseURL = serverBaseUrl.prod
		break
	default:
		baseURL = serverBaseUrl.local
}
const $http = axios.create();
$http.defaults.baseURL = baseURL
$http.defaults.timeout = 20000;
$http.defaults.headers['common']['X-Requested-With'] = 'XMLHttpRequest';
$http.defaults.withCredentials = true;

export default $http