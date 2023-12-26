import {UserModel} from "../models";
import {ActiveStatus, ErrorCode, OtpType, SendEmail, TokenType, UserStatus, Utils} from "../utils";
import {recoverPersonalSignature} from 'eth-sig-util'
// import {Redis} from "../databases";
import {config} from "../config";

// import {OTPController} from "./otp.controller";


export class UserController {
    public static async getByEmail(email: string) {
        return UserModel.getByType('email', email);
    };

    public static async get(userId: number) {
        const user: any = await UserModel.get(userId);
        if (!user)
            throw ErrorCode.USER_NOT_FOUND;
        return user;
    };

    public static async list(data: any) {
        return UserModel.list(data)
    }

    public static async userLike(data: any) {
        if (data.type == 1) {
            return UserModel.userLike(data)
        } else if (data.type == 2) {
            return UserModel.listLike(data)
        }
    }

    public static async listLike(data: any) {
        return UserModel.listLike(data)
    }

    public static async like(data: any) {
        const user = await UserModel.get(data.user_id)
        if (!user) throw ErrorCode.USER_NOT_FOUND;
        if (user.status != ActiveStatus.ACTIVATED) throw ErrorCode.USER_NOT_ACTIVE;

        return await UserModel.like(data)
    }

    public static async trending(data: any) {
        return await UserModel.trending(data)
    }

    public static async search(data: any) {
        if (!data.favorite || data.favorite.length == 0) {
            return await UserModel.listSearch(data)
        } else {
            return await UserModel.listSearchV2(data)

        }
    }

    public static async update(data: any, userId: number){
        const user = await UserModel.get(data.user_id)
        if(!user) throw ErrorCode.USER_NOT_FOUND

        await UserModel.update(data);

        const userUpdated = await UserModel.get(userId);
        console.log(userUpdated)
        return userUpdated;
    }

}
