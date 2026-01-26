const { defineConfig } = require('@vue/cli-service');
// import defineConfig from '@vue/cli-service';
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,

  // ✅ prevent exposing source code in browser DevTools
  productionSourceMap: false,

  // ✅ set public path for deployment
  publicPath: process.env.NODE_ENV === 'production' ? '' : '/',

  // ✅ output build files to backend/public (optional)
  // outputDir: path.resolve(__dirname, '../backend/public'),

  // devServer: {
  //   proxy: {
  //     '/': {
  //       target: 'https://apps.elgservices.lk'
  //     }
  //   },
  //   historyApiFallback: true
  // },

  configureWebpack: {
    devtool: false
  }
  
})


// const { defineConfig } = require('@vue/cli-service')
// const path = require('path');
// module.exports = defineConfig({
//   transpileDependencies: true
// });
////////////////////////////////////////////
// publicPath: process.env.NODE_ENV === 'production'
//  module.exports = {
//  publicPath: process.env.NODE_ENV === 'production'? '': '/'
//  }
//////////////////////////////////////////////////////

// module.exports = {
//   outputDir: path.resolve(__dirname, '../backend/public'),
//   devServer: {
//     proxy: {
//       '/': {
//         target: 'http://localhost:8081'
//       }
//     }
//   }
// }

// module.exports = {
//   publicPath: process.env.NODE_ENV === 'production' ? '' : '/',
//   devServer: {
//     historyApiFallback: true
//   }
// }

