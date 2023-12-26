import { GroupModel, UserModel } from "../models";
import { ErrorCode, GroupType } from "../utils";

export class GroupController {
    public static async listMembers(group_id: number) {
        return GroupModel.listGroupMembers(group_id);
    }

    public static async listMyGroup(data: any) {
        if (!data.user_id) {
            throw ErrorCode.USER_NOT_FOUND;
        }
        return GroupModel.listDirect(data);
    }

    public static async get(data: any) {
        return GroupModel.getGroup(data)
    }

    public static async create(data: any) {
        const user = await UserModel.get(data.user_id)
        if (!user) throw ErrorCode.USER_NOT_FOUND

        return await GroupModel.create({
            user_id_1: data.user_id,
            user_id_2: data.me
        })
    }
}
