import {ChatModel, GroupModel, UserModel} from "../models";
import {Redis} from "../databases";
import {GroupController} from "./group.controller";
import {ActiveStatus, ChatStatus, ErrorCode, GroupType} from "../utils";

export class ChatController {
    public static async list(data: any) {
        const group = await GroupModel.get(data.group_id);
        if (!group) {
            throw ErrorCode.GROUP_NOT_EXISTS;
        }
        // if (group.type == GroupType.GROUP) {
        //     const groupMember = await GroupModel.getGroupMember(data.group_id, data.user_id);
        //     if (!groupMember)
        //         throw ErrorCode.USER_NOT_IN_GROUP;
        // } else if (group.type == GroupType.DIRECT) {
        //     if (group.owner_id != data.user_id && group.direct_member != data.user_id) throw ErrorCode.USER_NOT_IN_GROUP;
        // }

        if (group.user_id_1 != data.user_id && group.user_id_2 != data.user_id) throw ErrorCode.USER_NOT_IN_GROUP;
        return await ChatModel.list(data);
    }

    public static async chat(user_id: number, reqData: any) {
        const group = await GroupModel.get(reqData.group_id);
        if (!group) {
            throw ErrorCode.GROUP_NOT_EXISTS;
        }
        let chat_id;
        let chat;

        if (group.user_id_1 != user_id && group.user_id_2 != user_id) throw ErrorCode.USER_NOT_IN_GROUP;
        console.log('check chat', user_id, ' ', reqData.group_id)
        chat_id = await ChatModel.create({user_id, group_id: reqData.group_id,  content: reqData?.content, image: reqData?.image, gif: reqData.gif});
        chat = await ChatModel.get(chat_id);

        // if (group.type == GroupType.GROUP) {
        //     const groupMember = await GroupModel.getGroupMember(reqData.group_id, user_id);
        //     console.log('check chat', user_id, ' ', groupMember)
        //     if (!groupMember)
        //         throw ErrorCode.USER_NOT_IN_GROUP;
        //
        //     chat_id = await ChatModel.create({user_id, group_id: reqData.group_id, message: reqData?.message, image: reqData?.image, gif: reqData.gif});
        //     chat = await ChatModel.get(chat_id);
        // } else if (group.type == GroupType.DIRECT) {
        //     //if (group.status != ActiveStatus.ACTIVATED) throw ErrorCode.GROUP_NOT_EXISTS
        //     if (group.user_id_1 != user_id && group.user_id_2 != user_id) throw ErrorCode.USER_NOT_IN_GROUP;
        //     console.log('check chat', user_id, ' ', reqData.group_id)
        //     chat_id = await ChatModel.create({user_id, group_id: reqData.group_id,  content: reqData?.message, image: reqData?.image, gif: reqData.gif});
        //     chat = await ChatModel.get(chat_id);
        // }
        await Redis.defaultCli.publish(
            'pub:message',
            JSON.stringify({
                type: "new_chat",
                data: chat,
            })
        );

        return chat;
    }

    public static async edit(data: any) {
        let chat = await ChatModel.get(data.chat_id);
        //check chat
        if (!chat || chat.status == ChatStatus.DELETED)
            throw ErrorCode.CHAT_NOT_FOUND;
        //check group
        const group = await GroupModel.get(chat.group_id);
        if (!group) {
            throw ErrorCode.GROUP_NOT_EXISTS;
        }


        if (group.type == GroupType.GROUP) {
            const groupMember = await GroupModel.getGroupMember(chat.group_id, chat.user_id);
            console.log('check chat', chat.user_id, ' ', groupMember)
            if (!groupMember)
                throw ErrorCode.USER_NOT_IN_GROUP;

            await ChatModel.update({
                ...data
            })
        } else if (group.type == GroupType.DIRECT) {
            if (group.status != ActiveStatus.ACTIVATED) throw ErrorCode.GROUP_NOT_EXISTS
            if (group.owner_id != chat.user_id && group.direct_member != chat.user_id) throw ErrorCode.USER_NOT_IN_GROUP;
            console.log('check chat', chat.user_id, ' ', chat.group_id)
            await ChatModel.update({
                ...data
            })
        }
        //socket
        const chatNew = await ChatModel.get(data.chat_id)
        await Redis.defaultCli.publish(
            'pub:message',
            JSON.stringify({
                type: "edit_chat",
                data: chatNew,
            })
        );
        return chatNew;
    }

    public static async deleteChat(data: any) {
        const chat_id = data.chat_id
        let chat = await ChatModel.get(chat_id);
        //check chat
        if (!chat)
            throw ErrorCode.CHAT_NOT_FOUND;
        if (chat.user_id != data.user_id) throw ErrorCode.NOT_OWNER
        await ChatModel.deleteChat({id: chat_id});
        //socket
        await Redis.defaultCli.publish(
            'pub:message',
            JSON.stringify({
                type: "delete_chat",
                data: await ChatModel.get(data.chat_id),
            })
        );
        return {
            status: 1,
            message: 'deleted'
        };
    }
}
