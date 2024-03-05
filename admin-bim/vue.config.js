const path = require('path');
const contentBase = path.resolve(__dirname, '..', '..');

module.exports = {

    configureWebpack: {
        devServer: {
          headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
	    "Access-Control-Allow-Origin": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
          }
        }
    }
}
