module.exports = {
    configureWebpack: {
        output: {
            jsonpFunction: 'webpackJsonpDemoVue',
            filename: 'js/app.js', // override to prevent hash from appearing
            chunkFilename: 'js/[name].js', // override to prevent hash from appearing
        },
    },
    publicPath:
        process.env.NODE_ENV === 'production'
            ? '/demo/vue/dist/'
            : `http://localhost:${process.env.REACT_APP_VUE_PORT}/`,
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
        },
    },
};
