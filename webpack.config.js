const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

const pkg = require('./package.json');

const validate = require('webpack-validator');

const devConfig = require('./libs/webpack.dev.config');
const prodConfig = require('./libs/webpack.prod.config');

const loaders = require('./libs/webpack.loaders');
const minify = require('./libs/webpack.minify');
const definePlugin = require('./libs/webpack.defineplugin');
const commonsChunkPlugin = require('./libs/webpack.commonschunkplugin');
const cleanWebpackPlugin = require('./libs/webpack.clean');
const purifyCSS = require('./libs/webpack.purifycss');

const webpack = require('webpack');

process.env.BABEL_ENV = TARGET;

const PATHS = {
    app: path.resolve(__dirname, 'app'),
    style: [
        path.resolve(__dirname, 'app/main.scss'),
        path.resolve(__dirname, 'node_modules/purecss')
    ],
    build: path.resolve(__dirname, 'build')
};

const common = {
    entry: {
        app: PATHS.app,
        style: PATHS.style
    },
    output: {
        path: PATHS.build,
        filename: "[name].js"
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'index'
        })
    ],
    resolve: {
        alias: {
            'react': path.join(__dirname, 'node_modules', 'react')
        },
        extensions: ['', '.js', '.jsx', '.css', '.scss']
    }
};

var config;

switch(process.env.npm_lifecycle_event) {
    case 'build':
    case 'stats':
        config = merge(common,
            loaders.es6Loader(PATHS.app),
            loaders.styleExtracts(PATHS.style),
            purifyCSS.purify([PATHS.app]),
            minify.minify(),
            definePlugin.setFreeVariable('process.env.NODE_ENV', 'production'),
            cleanWebpackPlugin.cleanWebpack(PATHS.build),
            commonsChunkPlugin.extractBundle({
                name: 'vendor',
                entries: Object.keys(pkg.dependencies)
            }),
            prodConfig.prodServer({PATHS})
        );
        break;
    default:
        config = merge(common,
            loaders.es6Loader(PATHS.app),
            loaders.styleLoaders(PATHS.style),
            devConfig.devServer({
                host: process.env.HOST,
                port: process.env.PORT
            })
        );
}

module.exports = validate(config, {
    quiet: true
});