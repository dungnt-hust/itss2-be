import {Application, Request, Response, Router} from "express"
import {hpr, logger, OtpWay, routeResSuccess, Utils,} from "../utils"
import Joi from "joi"
import {LoginHistoryController} from "../controllers";
import geoip from 'geoip-lite'
import {UAParser} from 'ua-parser-js'
import {AuthController} from "../controllers/auth.controller";
import {UserModel} from "../models";


const login = async (req: Request, res: Response) => {
    const { email, password} = await Joi.object()
        .keys({
            email: Joi.string().required(),
            password: Joi.string().required(),
        })
        .and('email', 'password')
        .validateAsync(req.body)

    let ip: any = req.headers['x-forwarded-for'] || req.headers["x-real-ip"] || req.connection.remoteAddress || ""
    ip = ip.split(',')[0];
    if (ip.includes('::ffff:')) {
        ip = ip.split(':').reverse()[0]
    }
    const geo = geoip.lookup(ip as string)
    const ua = new UAParser(req.headers['user-agent'])


    const login_res = await AuthController.login(email, password);

    logger.trace("geo", geo);
    const userAgent = ua.getResult();
    const location = geo ? [geo.city, geo.region, geo.country] : []
    LoginHistoryController.create({
        ip: ip,
        user_id: login_res.user_info.id,
        browser: userAgent.browser.name ? `${userAgent.browser.name}/${userAgent.browser.version}` : null,
        os: userAgent.os.name ? `${userAgent.os.name}/${userAgent.os.version}` : null,
        device: userAgent.device.vendor ? `${userAgent.device.vendor}/${userAgent.device.model}` : null,
        location: location.filter(Boolean).join(', '),
        country: location.filter(Boolean).length?location.filter(Boolean).reverse()[0]:'',
    }).catch(e => logger.error('LoginHistory create', e));

    routeResSuccess(res, {
        ...login_res,
        geo,
        ipAddr: ip,
    })
}

const getVerifyEmailCode = async (req: Request, res: Response) => {
    const { email} = await Joi.object()
        .keys({
            email: Joi.string().email().required(),
        })
        .validateAsync(req.body)

    await AuthController.getVerifyCode(OtpWay.EMAIL, email);

    return routeResSuccess(res, {})
}
const register = async (req: Request, res: Response) => {
    const { email, password, code } = await Joi.object()
        .keys({
            email: Joi.string().required(),
            password: Joi.string().custom(Utils.passwordMethod).required(),
            age: Joi.number().required(),
            gender: Joi.number().required()
        })
        .and('email', 'password')
        .validateAsync(req.body)

    const newUserId = await AuthController.emailRegister({
        email,
        password,
        code
    })
  //

    return routeResSuccess(res, await UserModel.get(newUserId))
}


export const AuthRoute = (app: Application) => {
    const authRouter = Router()
    app.use("/auth", authRouter)
    // Children
    authRouter.post("/login", hpr(login));
    authRouter.post("/get-verify-email-code", hpr(getVerifyEmailCode));
    authRouter.post("/register", hpr(register));
}
