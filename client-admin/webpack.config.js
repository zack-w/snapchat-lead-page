var path = require("path");
var DIST_DIR = path.resolve(__dirname, "dist");
var SRC_DIR = path.resolve(__dirname, "src");
var config = {
    entry: ['@babel/polyfill', SRC_DIR + "/app/index.js"],
    output: {
        path: DIST_DIR + "/app",
        filename: "bundle.js",
        publicPath: "/app/"
    },
    devServer: {
        disableHostCheck: true
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
            },
            {
                test: /\.css$/,
                loader: "css-loader"
            },
            {
                test: /\.scss$/,
                loader: "webpack-sass",
                options: {
                    url: false
                }
            }
        ]
    }
};
module.exports = config;