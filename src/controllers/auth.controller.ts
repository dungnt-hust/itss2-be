import {UserModel} from "../models";
import {ErrorCode, OtpType, OtpWay, TokenType, UserStatus, Utils} from "../utils";
// import {Redis} from "../databases";
// import {OTPController} from "./otp.controller";
import {UserController} from "./user.controller";


export class AuthController {
    public static async getVerifyCode (otpWay: OtpWay, id: string) {
        let _otpWay: string = OtpWay[otpWay].toLowerCase();
        const user = await UserModel.getByType(_otpWay, id);
        if (user)
            throw ErrorCode.USER_EXISTS;
        // verify code
        // await OTPController.send_otp(OtpType.VERIFY_EMAIL, otpWay, id.trim().toLowerCase());
    };

    // data: otpWay, id, code, password
    public static async emailRegister(data: any) {

        const user = await UserModel.getByType('email', data.email);
        if (user)
            throw ErrorCode.USER_EXISTS;

        // check code
        // await OTPController.verify_otp(OtpType.VERIFY_EMAIL, OtpWay.EMAIL, data.email, data.code);

        const userInfo = {
            email: data.email,
            name: data.email.split('@')[0],
            password: data.password,
        }
        return UserModel.create(userInfo);
    };


    public static async login (email:string, password: string) {
        const userInfo = await UserModel.getByType('email', email);
        if (!userInfo) throw ErrorCode.USER_NOT_FOUND
        if (userInfo.status === UserStatus.DEACTIVATED)
            throw {
                error_code: ErrorCode.USER_NOT_ACTIVE_YET,
                data: { email: userInfo.email.slice(0, 2) + '***' }
            };
        if (userInfo.status === UserStatus.BANNED)
            throw ErrorCode.USER_BANNED;
        const user_auth = await UserModel.getUserAuth(userInfo.id);
        const isValidPw = await Utils.comparePassword(password, user_auth.password_hash)
        console.log(isValidPw)
        if (!isValidPw) throw ErrorCode.PASSWORD_IS_INVALID


        const timestamp = Date.now();
        const auth_token = Utils.getUserToken({ userId: userInfo.id, timestamp, type: TokenType.LOGIN });
        // await Redis.defaultCli.publish(`login_event`, JSON.stringify({ userId: userInfo.id, timestamp }));

        return {
            token: auth_token,
            user_info: await UserController.get(userInfo.id),
            expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
    };

}
