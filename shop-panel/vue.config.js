const path = require('path');
const contentBase = path.resolve(__dirname, '..', '..');

module.exports = {

    lintOnSave: false,
    configureWebpack: {
        devServer: {
          headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
          }
        }
    }
}
