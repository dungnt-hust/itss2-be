import {ChatStatus, ErrorCode, logger, MathUtils, Utils} from "../utils";
import {doQuery, sql} from "../databases";

export const ChatModel = {
    list: async (data: any) => {
        let query = `select c.id,
                       c.group_id,
                       c.user_id,
                       c.status,
                       c.created_time,
                       c.updated_time,
                       c.content,
                       u.fullname,
                       u.avatar
                from chats c
                         inner join users u on c.user_id = u.id
                         inner join \`groups\` g on c.group_id = g.id
                where c.group_id = ${data.group_id}`;
        const fields: any[] = [];
        return {
            data: await doQuery.listRows(query, fields, data),
            total: await doQuery.countRows(query, fields),
        };
    },
    get: async (chat_id: number) => {
        let query = `select c.id,
                       c.group_id,
                       c.user_id,
                       c.status,
                       c.created_time,
                       c.updated_time,
                       c.content,
                       u.fullname,
                       u.avatar
                from chats c
                         inner join users u on c.user_id = u.id
                         inner join \`groups\` g on c.group_id = g.id
                        where c.id = ${chat_id}`;

        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },
    create: async (data: any, conn = sql) => {
        const insert_obj: any = {
            user_id: data.user_id,
            group_id: data.group_id,
        };
        if (data.content) insert_obj.content = data.content;
        if (data.image) insert_obj.image = JSON.stringify(data.image);
        if (data.gif) insert_obj.gif = JSON.stringify(data.gif);

        return doQuery.insertRow("chats", insert_obj, conn);
    },
    deleteChat: async (data: any, conn = sql) => {
        let query: string = `UPDATE chats SET status = ${ChatStatus.DELETED} where id = ${data.id} and (status = ${ChatStatus.CREATED} or status = ${ChatStatus.EDITED}) `
        let [result1] = await conn.query(query);
        // @ts-ignore
        if (result1.affectedRows == 0) throw ErrorCode.UNKNOWN_ERROR;
    },

    update: async (data: any, conn = sql) => {
        const item: any = {};
        if (data.message) item.message = data.message;
        if (data.image) item.image = JSON.stringify(data.image);
        if (data.gif) item.gif = JSON.stringify(data.gif);
        item.status = ChatStatus.EDITED;

        return doQuery.updateRow("chats", item, data.chat_id, conn);
    },
};
