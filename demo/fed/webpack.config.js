const {ModuleFederationPlugin} = require('webpack').container;
const path = require('path');

module.exports = {
    entry: './src/index',
    mode: process.env.NODE_ENV || 'development',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: process.env.REACT_APP_FED_PORT,
    },
    output: {
        publicPath:
            process.env.NODE_ENV === 'production'
                ? '/demo/fed/dist/'
                : `http://localhost:${process.env.REACT_APP_FED_PORT}/`,
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
        ],
    },
    plugins: [
        new ModuleFederationPlugin({
            name: 'web_app_federation',
            library: {type: 'var', name: 'web_app_federation'},
            filename: 'remoteEntry.js',
            exposes: {
                './App': './src/App',
                './index': './src/index',
            },
            shared: {
                'react-dom': 'react-dom',
                moment: '^2.24.0',
                react: {
                    import: 'react', // the "react" package will be used a provided and fallback module
                    shareKey: 'react', // under this name the shared module will be placed in the share scope
                    shareScope: 'default', // share scope with this name will be used
                    singleton: true, // only a single version of the shared module is allowed
                },
            },
        }),
    ],
};
