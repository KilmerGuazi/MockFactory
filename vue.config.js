const path = require('path')

module.exports = {
	// 基本路径
	publicPath: process.env.NODE_ENV === "production"?"/dist":"/",
	// 输出文件目录
	outputDir: process.env.outputDir,
	// 关闭eslint检查
	lintOnSave: false,
	// devServer:{
	//   proxy:{
	// 	  '/api':{
	// 		  target:'http://localhost:9999/',
	// 		  changeOrigin:true,
	// 		  pathRewrite:{
	// 			  '^/api':''
	// 		  }
	// 	  }
	//   }
	// }

	configureWebpack: {
		resolve: {
		  symlinks: false,
		  alias: {
			vue: path.resolve('./node_modules/vue')
		  }
		}
	}
}