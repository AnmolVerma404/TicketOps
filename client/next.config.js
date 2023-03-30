/**
 * This basically pull's the next up every 300ms.
 * And if's new content is avaliable and web page is not loaded.
 * It automatically replodes it
 */
module.exports = {
    webpackDevMiddleware: config =>{
        config.watchOptions.poll = 300;
        return config;
    }
}