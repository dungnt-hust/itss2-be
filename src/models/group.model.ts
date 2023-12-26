import {ActiveStatus, ErrorCode, logger, MathUtils, Utils, GroupType} from "../utils";
import {doQuery, sql} from "../databases";
import {config} from "../config";

export const GroupModel = {
    listGroup: async (data: any) => {
        let query = `select g.id, g.owner_id, g.type, g.status, g.created_time, g.updated_time, sss.price, u.full_name, u.avatar, u.full_name name,
                           (select coalesce(count(*), 0) as member_in_group
                            from group_members gm
                            where group_id = g.id
                              and gm.status = ${ActiveStatus.ACTIVATED}) as member
                    from \`groups\` g
                    left join subject_sale_stats sss on g.owner_id = sss.user_id
                    join users u on g.owner_id = u.id 
                    where g.status = ${ActiveStatus.ACTIVATED} and g.type = ${GroupType.GROUP}`;
        const fields: any[] = [];
        if (data.user_id) {
            query += ` and g.id in (select group_id from group_members where user_id = ${data.user_id} and status = ${ActiveStatus.ACTIVATED})`;
        }

        if (data.search) {
            query += ` and ( (Lower(g.name) like ? )`;
            fields.push("%" + data.search.toLowerCase() + "%");
            query += ` or (Lower(u.full_name) like ? ) )`;
            fields.push("%" + data.search.toLowerCase() + "%");
        }
        return {
            data: await doQuery.listRows(query, fields, data),
            total: await doQuery.countRows(query, fields),
        };
    },
    listDirect: async (data: any) => {
        let query = `select g.id,
                           u1.id  as a_id,
                           u1.fullname      as a_name,
                           u1.avatar    as a_avatar,
                           u.id        as b_id,
                           u.fullname as b_name,
                           u.avatar    as b_avatar,
                           g.created_time,
                           g.updated_time
                    from \`groups\` g
                             join users u on g.user_id_1 = u.id
                            join users u1 on g.user_id_2 = u1.id
                            join (select distinct group_id from chats) c on c.group_id = g.id
                    where 1=1
                        and (g.user_id_1 = ${data.user_id} or g.user_id_2 = ${data.user_id})`;
        const fields: any[] = [];
        if (data.search) {
            query += ` or (Lower(u.full_name) like ? ) )`;
            fields.push("%" + data.search.toLowerCase() + "%");
        }
        return {
            data: await doQuery.listRows(query, fields, data),
            total: await doQuery.countRows(query, fields),
        };
    },
    get: async (group_id: number) => {
        let query = `select *
                    from \`groups\`
                    where id = ${group_id}`;
        return doQuery.getOne(query, []);
    },
    getGroupMember: async (group_id: number, user_id: number) => {
        let query = `select *
                    from group_members
                    where group_id = ? and user_id = ? and status = ${ActiveStatus.ACTIVATED}`;
        return doQuery.getOne(query, [group_id, user_id]);
    },
    listGroupMembers: async (group_id: number) => {
        let query = `select gm.*, u.address, u.avatar
                    from group_members gm
                    inner join users u on gm.user_id = u.id
                    where group_id = ${group_id}`;
        let [result, ignored]: any[] = await sql.query(query);
        return result;
    },
    create: async (data: any, conn?: any) => {
        return doQuery.insertRow("`groups`", data, conn);
    },

    createGroupMember: async (data: any, conn?: any) => {
        return doQuery.insertRow("group_members", data, conn);
    },

    update: async (data: any, conn?: any) => {
        return doQuery.updateRow("`groups`", data, data.id, conn);
    },

    getGroupByOwner: async (user_id: number) => {
        let query = `select *
                    from \`groups\`
                    where owner_id = ${user_id} and type = ${GroupType.GROUP}`;
        return doQuery.getOne(query, []);
    },
    getGroupMemberWithoutStatus: async (group_id: number, user_id: number) => {
        let query = `select *
                    from group_members
                    where group_id = ? and user_id = ?`;
        return doQuery.getOne(query, [group_id, user_id]);
    },
    updateGroupMember: async (data: any, conn?: any) => {
        if (!conn) conn = sql.getConnection();
        let query = `update group_members
                    set status = ?
                    where group_id = ? and user_id = ?`;
        let [results, ignored] = await conn.query(query, [data.status, data.group_id, data.user_id]);
        //console.log(results)
        if (!results && results.affectedRows == 0) throw ErrorCode.UNKNOWN_ERROR;
    },
    getGroupMemberByIdWithoutStatus: async (owner_id: number, buyer_id: number, type: number) => {
        let query = `select * from \`groups\` g
                        join group_members gm on g.id = gm.group_id
                        where owner_id = ${owner_id} and g.type = ${type} and user_id = ${buyer_id}`;
        return doQuery.getOne(query, []);
    },

    getGroup: async (data: any) => {
        let query: string = `select g.id,
                           u1.id  as a_id,
                           u1.fullname      as a_name,
                           u1.avatar    as a_avatar,
                           u.id        as b_id,
                           u.fullname as b_name,
                           u.avatar    as b_avatar,
                           g.created_time,
                           g.updated_time
                    from \`groups\` g
                             join users u on g.user_id_1 = u.id
                            join users u1 on g.user_id_2 = u1.id
                            join (select distinct group_id from chats) c on c.group_id = g.id
                    where 1=1
                        and (g.user_id_1 = ${data.user_id} or g.user_id_2 = ${data.user_id})`
        return doQuery.getOne(query, []);

        // listDirect: async (data: any) => {
        //     let query = `select g.id,
        //                    u1.id  as a_id,
        //                    u1.full_name      as a_name,
        //                    u1.avatar    as a_avatar,
        //                    sssa.price     a_price,
        //                    u.id        as b_id,
        //                    u.full_name as b_name,
        //                    u.avatar    as b_avatar,
        //                    sssb.price     b_price,
        //                    g.type,
        //                    g.status,
        //                    g.created_time,
        //                    g.updated_time
        //             from \`groups\` g
        //                      join users u on g.direct_member = u.id
        //                     join users u1 on g.owner_id = u1.id
        //                      left join subject_sale_stats sssa on g.owner_id = sssa.user_id
        //                      left join subject_sale_stats sssb on u.id = sssb.user_id
        //                     join (select distinct group_id from chats) c on c.group_id = g.id
        //             where g.status = ${ActiveStatus.ACTIVATED}
        //               and g.type = ${GroupType.DIRECT}
        //                 and (g.owner_id = ${data.user_id} or g.direct_member = ${data.user_id})`;
        //     const fields: any[] = [];
        //     if (data.search) {
        //         query += ` and ( (Lower(g.name) like ? )`;
        //         fields.push("%" + data.search.toLowerCase() + "%");
        //         query += ` or (Lower(u.full_name) like ? ) )`;
        //         fields.push("%" + data.search.toLowerCase() + "%");
        //     }
        //     return {
        //         data: await doQuery.listRows(query, fields, data),
        //         total: await doQuery.countRows(query, fields),
        //     };
        // },
    }
};
