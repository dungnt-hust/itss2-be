import {sql, doQuery} from '../databases';
import {ActiveStatus, ConfigType, ErrorCode, Gender, LikeStatus, logger, UserStatus, Utils} from '../utils';

export const UserModel = {
    get: async (userId:number) => {
        let query: string = `select * from users u left join (select JSON_ARRAYAGG(favorite_id) favorite, user_id
                      from user_favorites
                      group by user_id) uf on u.id = uf.user_id where id = ?`;
        let [result, ignored]: any[] = await sql.query(query, [userId]);
        return result.length ? result[0] : null;
    },
    getByType: async (type: string, value: string) => {
        let query: string = `select * from users where LOWER(${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [value.trim().toLowerCase()]);
        return result.length ? result[0] : null;
    },
    create: async (data: any) => {

        const item: any = {
            status: UserStatus.ACTIVATED
        };
        if (data.email) item.email = data.email.trim().toLowerCase();
        if (data.mobile) item.mobile = data.mobile;
        if (data.name) item.name = data.name;
        if (data.gender) item.gender = data.gender;
        if (data.age) item.age = data.age;

        let conn = await sql.getConnection();
        try {
            await conn.query("START TRANSACTION");
            logger.trace("start transaction");

            // create user
            let user_id = await doQuery.insertRow('users', item, conn);
            // create password
            await doQuery.insertRow('user_auths', {
                user_id,
                password_hash: await Utils.hashPassword(data.password)
            }, conn);
            if (!data.gender)
                data.gender = Gender.MALE;
            data.user_id = user_id;
            // init item default
            await conn.query("COMMIT");
            logger.trace("transaction COMMIT");
            conn.release();
            logger.trace("transaction release");
            return user_id;
        } catch (e) {
            logger.error(e);
            await conn.query("ROLLBACK");
            conn.release();
            throw ErrorCode.UNKNOWN_ERROR;
        }
    },
    updatePassword: async (user_id: number, password: string) => {
        const password_hash = await Utils.hashPassword(password);

        let query = ` Update user_auths set password_hash = '${password}' where  user_id = ${user_id} `
        let [result, ignored]: any[] = await sql.query(query);
        if (result.affectedRows === 0)
            throw ErrorCode.UNKNOWN_ERROR;
    },

    update: async (data: any) => {
        const user_id = data.user_id;
        // const item: any = {}
        // if (data.email) item.email = data.email;
        // if (data.mobile) item.mobile = data.mobile;
        // if (data.name) item.mobile = data.name;
        // if (data.gender) item.gender = data.gender;
        // if (data.last_read_notification) item.last_read_notification = data.last_read_notification;
        // if (data.level) item.level = data.level;
        // if (data.status != undefined) item.status = data.status;
        delete data.user_id;
        return doQuery.updateRow('users', data, user_id)
    },
    getUserAuth: async (userId: number) => {
        let query: string = `select * from user_auths where user_id = ${userId}`;
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },

    list: async (data: any) => {
        let query: string = `select * from users where status = ${ActiveStatus.ACTIVATED}`
        const fields: any[] = [];
        return {
            data: await doQuery.listRows(query, data, fields),
            total: await doQuery.countRows(query, fields)
        }
    },

    userLike: async (data: any) => {
        let query: string = `select u.*, uk.status is_like
                                from user_likes ul
                                         join users u on u.id = ul.user_like
                                 left join (select * from user_likes where user_like = ${data.user_id} ) uk
                                on uk.user_id = u.id
                                where ul.user_id = ${data.user_id}`
        const fields: any[] = [];
        return {
            data: await doQuery.listRows(query, data, fields),
            total: await doQuery.countRows(query, fields)
        }
    },

    listLike: async (data: any) => {
        let query: string = `select u.* from user_likes ul
                                 join users u on u.id = ul.user_id
                                 where user_like = ${data.user_id}`
        const fields: any[] = [];
        return {
            data: await doQuery.listRows(query, data, fields),
            total: await doQuery.countRows(query, fields)
        }
    },

    like: async (data: any, conn?: any) => {
        if (!conn) conn = sql;

        let query: string = `INSERT INTO user_likes (user_id, user_like, status)
                                VALUES (${data.user_id}, ${data.user_like}, ${LikeStatus.LIKE})
                                ON DUPLICATE KEY UPDATE
                                    status = IF(status = ${LikeStatus.LIKE} , ${LikeStatus.UNLIKE}, ${LikeStatus.LIKE})`;
        logger.info("query", query);
        let [result1] = await conn.query(query);
        return true
    },

    trending: async (data: any) => {
        let query: string = `select u.*, ul.count_like, c.name city_name
                            from users u
                                     left join (select count(*) count_like, user_id from user_likes where status = 1 group by user_id) ul
                                          on u.id = ul.user_id
                            left join cities c on c.id = u.city
                            order by count_like desc`

        const fields: any[] = [];
        return {
            data: await doQuery.listRows(query, data, fields),
            total: await doQuery.countRows(query, fields)
        }
    },

    listSearch: async (data: any) => {
        let query: string = `select u.*, c.name city_name from users u
         join cities c on c.id = u.city
         where u.status = ${ActiveStatus.ACTIVATED} `

        if (data.city){
            query += ` and city = ${data.city}`
        }
        if (data.age_from && data.age_to){
            query += ` and (age > ${data.age_from} and age < ${data.age_to})`
        }
        if(data.gender) {
            query += ` and gender = ${data.gender}`
        }
        const fields: any[] = [];
        return {
            data: await doQuery.listRows(query, data, fields),
            total: await doQuery.countRows(query, fields)
        }
    },

    listSearchV2: async (data: any) => {
        let query : string = `select *
                from (select JSON_ARRAYAGG(favorite_id) favorite, user_id
                      from user_favorites
                      where favorite_id in (${data.favorite})
                      group by user_id) f
                         join (select u.*, c.name city_name from users u
         join cities c on c.id = u.city
         where u.status = ${ActiveStatus.ACTIVATED} ) u on u.id = f.user_id
                where 1 = 1`
        if (data.city){
            query += ` and city = ${data.city}`
        }
        if (data.age_from && data.age_to){
            query += ` and (age > ${data.age_from} and age < ${data.age_to})`
        }
        if(data.gender) {
            query += ` and gender = ${data.gender}`
        }
        const fields: any[] = [];
        return {
            data: await doQuery.listRows(query, data, fields),
            total: await doQuery.countRows(query, fields)
        }
    }

};
