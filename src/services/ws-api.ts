import * as WS from 'ws'
import jwt from "jsonwebtoken";
import {Redis} from "../databases";
import {ErrorCode, GroupType, logger, MathUtils, UserStatus} from "../utils";
import {config} from "../config";
import {GroupModel, UserModel} from "../models";
import {GroupController} from "../controllers";

const subscriber: any = Redis.newRedis();

const startServe = async () => {
    let port: number = config.wsPort;
    const wss = new WS.Server({port});
    logger.info(`Server is running ws://localhost:${port}...`)


    subscriber.on("message", async (channel: string, message: string) => {
        try {
            switch (channel) {
                case 'user-event': {
                    const messageObj: any = JSON.parse(message)
                    wss.clients.forEach((client: any) => {
                        if (client.readyState === 1) {
                            if (messageObj.hasOwnProperty("user_id")) {
                                if (client.user_id === messageObj.user_id) {
                                    client.send(JSON.stringify({type: 'user_event', data: messageObj}))
                                }
                            }
                        }
                    })
                    break;
                }
                case 'pub:message': {
                    const messageObj: any = JSON.parse(message)
                    logger.log('pub:message', messageObj);
                    switch (messageObj.type) {
                        case 'new_chat': {
                            const chat = messageObj.data;
                            const groupMembers:any[] = await GroupController.listMembers(chat.group_id);
                            const group = await GroupModel.get(chat.group_id);
                            //logger.debug(' Has New Chat gr type: ', GroupType[group.type])
                            wss.clients.forEach((client: any) => {
                                if (client.readyState === 1 && (client.user_id == group.user_id_1 || client.user_id == group.user_id_2)) {
                                    client.send(JSON.stringify({
                                        type: 'new_chat',
                                        group_id: chat.group_id,
                                        data: chat
                                    }));
                                }
                            });
                            // if (group.type == GroupType.GROUP){
                            //     wss.clients.forEach((client: any) => {
                            //         if (client.readyState === 1 && groupMembers.find(x => x.user_id == client.user_id)) {
                            //             client.send(JSON.stringify({
                            //                 type: 'new_chat',
                            //                 group_id: chat.group_id,
                            //                 data: chat
                            //             }));
                            //         }
                            //     });
                            // }else if (group.type == GroupType.DIRECT){
                            //     wss.clients.forEach((client: any) => {
                            //         if (client.readyState === 1 && (client.user_id == group.owner_id || client.user_id == group.direct_member)) {
                            //             client.send(JSON.stringify({
                            //                 type: 'new_chat',
                            //                 group_id: chat.group_id,
                            //                 data: chat
                            //             }));
                            //         }
                            //     });
                            // }
                            break;
                        }
                        case 'edit_chat': {
                            const chat = messageObj.data;
                            const groupMembers:any[] = await GroupController.listMembers(chat.group_id);
                            const group = await GroupModel.get(chat.group_id);
                            logger.debug(' Has edit_chat gr type: ', GroupType[group.type])
                            if (group.type == GroupType.GROUP){
                                wss.clients.forEach((client: any) => {
                                    if (client.readyState === 1 && groupMembers.find(x => x.user_id == client.user_id)) {
                                        client.send(JSON.stringify({
                                            type: 'edit_chat',
                                            group_id: chat.group_id,
                                            data: chat
                                        }));
                                    }
                                });
                            }else if (group.type == GroupType.DIRECT){
                                wss.clients.forEach((client: any) => {
                                    if (client.readyState === 1 && (client.user_id == group.owner_id || client.user_id == group.direct_member)) {
                                        client.send(JSON.stringify({
                                            type: 'edit_chat',
                                            group_id: chat.group_id,
                                            data: chat
                                        }));
                                    }
                                });
                            }
                            break;
                        }
                        case 'delete_chat': {
                            const chat = messageObj.data;
                            const groupMembers:any[] = await GroupController.listMembers(chat.group_id);
                            const group = await GroupModel.get(chat.group_id);
                            logger.debug(' Has delete_chat gr type: ', GroupType[group.type])
                            if (group.type == GroupType.GROUP){
                                wss.clients.forEach((client: any) => {
                                    if (client.readyState === 1 && groupMembers.find(x => x.user_id == client.user_id)) {
                                        client.send(JSON.stringify({
                                            type: 'delete_chat',
                                            group_id: chat.group_id,
                                            data: chat
                                        }));
                                    }
                                });
                            }else if (group.type == GroupType.DIRECT){
                                wss.clients.forEach((client: any) => {
                                    if (client.readyState === 1 && (client.user_id == group.owner_id || client.user_id == group.direct_member)) {
                                        client.send(JSON.stringify({
                                            type: 'delete_chat',
                                            group_id: chat.group_id,
                                            data: chat
                                        }));
                                    }
                                });
                            }
                            break;
                        }
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        } catch (e) {
            logger.error(e)
        }
    });

    wss.on("connection", (ws: any) => {
        console.log("new connection");
        ws.groups = [];
        ws.on("message", async (data: string) => {
            let message: any;
            try {
                message = JSON.parse(data);
            } catch (e) {
                ws.send(JSON.stringify({
                    result: 'not ok',
                    error_code: ErrorCode[ErrorCode.PARSE_MESSAGE_ERROR]
                }));
            }
            if (typeof message === "object")
            {
                try {
                    switch (message.type) {
                        case 'login': {
                            let token = message.token;
                            let jwtPayload;
                            let jwtSecret: string = config.jwtSecret;
                            try {
                                jwtPayload = <any>jwt.verify(token, jwtSecret);
                            } catch (error) {
                                throw ErrorCode.TOKEN_IS_INVALID;
                            }
                            const {userId, timestamp} = jwtPayload

                            let user = await UserModel.get(userId);
                            if (!user || user.status != UserStatus.ACTIVATED
                            )
                                throw ErrorCode.USER_NOT_FOUND;
                            ws.user = user;
                            ws.user_id = userId;
                            ws.jwt_time = timestamp;
                            ws.groups.push('user:' + userId);

                            ws.send(JSON.stringify({
                                type: message.type,
                                error_code: "",
                                data: user
                            }))
                            break;
                        }
                        case 'subscribe': {
                            switch (message.data.type) {
                                default: {
                                    throw ErrorCode.CHANNEL_NOT_EXISTS;
                                }
                            }
                            break;
                        }
                        case 'unsubscribe': {
                            switch (message.data.type) {
                                default: {
                                    throw ErrorCode.CHANNEL_NOT_EXISTS;
                                }
                            }

                            break;
                        }
                        case 'ping': {
                            if (ws.user) {
                                // await UserModel.update_last_active(ws.user.id, Date.now());
                            }
                            ws.send(JSON.stringify({
                                type: message.type,
                                error_code: "",
                                data: 'pong',
                            }))
                            break;
                        }
                        default:
                            break;
                    }
                } catch (e: any) {
                    let data: any = {}
                    if (typeof e !== 'number') {
                        if (e.code) {
                            data = {error_code: e.code, error_msg: e.sqlMessage}
                        } else if (e.error_code) {
                            data = {error_code: ErrorCode[e.error_code], data: e.data}
                        } else {
                            data = {error_code: ErrorCode[ErrorCode.UNKNOWN_ERROR], error_msg: e.message}
                        }
                    } else {
                        data = {error_code: ErrorCode[Number(e)]}
                    }

                    ws.send(JSON.stringify({
                        type: message.type,
                        result: 'not ok',
                        ...data
                    }));
                }
            }
        });
    });

    subscriber.subscribe('pub:message');
    subscriber.subscribe('pub:comment');
    subscriber.subscribe('pub:activity');
    subscriber.subscribe('data-change');
    subscriber.subscribe('notification');
}

export const WsService = {
    startServe,
};

if (config.direct_service) {
    WsService.startServe().then().catch(logger.error);
}
