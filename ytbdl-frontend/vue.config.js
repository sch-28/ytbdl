module.exports = {
  devServer: {
    proxy: {
      "^/api": {
        target: "http://localhost:3080",
        pathRewrite: {'^/api': '/api/'},
        changeOrigin: true,
        logLevel: "debug"
      },
    },
    watchOptions: {
      poll: true, // or use an integer for a check every x milliseconds, e.g. poll: 1000,
      ignored: /node_modules/ // otherwise it takes a lot of time to refresh
    }
  },

  transpileDependencies: ["vuetify"],
};
