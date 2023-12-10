import { ErrorCode, logger, MathUtils, Utils } from "../utils";
import { doQuery, sql } from "../databases";

export const LoginHistoryModel = {
    list: async (data:any) => {
        let query = `select * from login_histories`;
        if (data.user_id) {
            query += ` where user_id = ?`;
        }
        return {
            data: await doQuery.listRows(query, [data.user_id], data),
            total: await doQuery.countRows(query, [data.user_id])
        }
    },
    create: async (data: any) => {
        return doQuery.insertRow('login_histories', data);
    },
};
