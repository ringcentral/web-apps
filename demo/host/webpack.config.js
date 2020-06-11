const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;
const path = require('path');

module.exports = {
    entry: './src/index',
    mode: process.env.NODE_ENV || 'development',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: process.env.REACT_APP_HOST_PORT,
        historyApiFallback: true,
    },
    output: {
        publicPath:
            process.env.NODE_ENV === 'production'
                ? '/demo/host/dist/'
                : `http://localhost:${process.env.REACT_APP_HOST_PORT}/`,
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: ['@babel/preset-react'],
                },
            },
            {
                test: /\.css?$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new ModuleFederationPlugin({
            name: 'web-app-host',
            library: {type: 'var', name: 'web-app-host'},
            shared: ['react', 'react-dom'],
        }),
        new HtmlWebpackPlugin({
            template: './public/index.html',
            base: process.env.NODE_ENV === 'production' ? '/demo/host/dist/' : '/',
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.REACT_APP_API_SERVER': JSON.stringify(process.env.REACT_APP_API_SERVER),
            'process.env.REACT_APP_HOST_CLIENT_ID': JSON.stringify(process.env.REACT_APP_HOST_CLIENT_ID),
            'process.env.REACT_APP_HOST_PORT': JSON.stringify(process.env.REACT_APP_HOST_PORT),
            'process.env.REACT_APP_REACT_PORT': JSON.stringify(process.env.REACT_APP_REACT_PORT),
            'process.env.REACT_APP_HOST_WC_PORT': JSON.stringify(process.env.REACT_APP_HOST_WC_PORT),
            'process.env.REACT_APP_VUE_PORT': JSON.stringify(process.env.REACT_APP_VUE_PORT),
            'process.env.REACT_APP_IFRAME_PORT': JSON.stringify(process.env.REACT_APP_IFRAME_PORT),
            'process.env.REACT_APP_ADMIN_PORT': JSON.stringify(process.env.REACT_APP_ADMIN_PORT),
            'process.env.REACT_APP_REACT_MENU_PORT': JSON.stringify(process.env.REACT_APP_REACT_MENU_PORT),
            'process.env.REACT_APP_ANGULAR_PORT': JSON.stringify(process.env.REACT_APP_ANGULAR_PORT),
            'process.env.REACT_APP_REACT_MENU_IFRAME_PORT': JSON.stringify(
                process.env.REACT_APP_REACT_MENU_IFRAME_PORT,
            ),
            'process.env.REACT_APP_FED_PORT': JSON.stringify(process.env.REACT_APP_FED_PORT),
        }),
    ],
};
