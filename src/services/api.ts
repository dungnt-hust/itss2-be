import * as fs from 'fs';
import * as https from 'https';
import express, {Application} from "express"

import {applyMiddleware} from "../middlewares"
import {AuthRoute, UserRoute} from "../routes"
import {config} from "../config"
import {logger} from "../utils";
// --- Setup router
const setupRouter = (app: Application) => {
    AuthRoute(app)
    UserRoute(app)
};

const startServe = async () => {
    const app: Application = express()
    applyMiddleware(app)
    setupRouter(app)


    /**
     * Support SSL for development
     * If you serve via web server or other SSL
     */
    const server = config.serverSslEnabled
        ? https.createServer({
            key: fs.readFileSync('./secrets/server.' + config.node_env + '.key'),
            cert: fs.readFileSync('./secrets/server.' + config.node_env + '.crt'),
            passphrase: ''
        }, app).listen(config.serverPort)
        : app.listen(config.serverPort);
    logger.info(`🚀 Server started as ${config.node_env} at http${config.serverSslEnabled ? 's' : ''}://localhost:${config.serverPort}`);

    // await WebSocketService.InitWebSocket({server})
};

export const ApiService = {
    startServe,
};

