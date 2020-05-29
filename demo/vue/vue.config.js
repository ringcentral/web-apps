module.exports = {
    configureWebpack: {
        output: {
            jsonpFunction: 'webpackJsonpDemoVue',
        },
    },
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
        },
    },
};
