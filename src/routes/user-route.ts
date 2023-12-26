import {Application, json, Request, Response, Router} from "express"
import {ErrorCode, hpr, OtpWay, routeResSuccess} from "../utils"
import Joi, {any} from "joi";
import {UserController} from "../controllers";
import {checkAuth} from "../middlewares";
import {config} from "../config";
import {AuthController} from "../controllers/auth.controller";


const get = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            user_id: Joi.number().required()
        })
        .validateAsync(req.query)

    return routeResSuccess(res, await UserController.get(data.user_id));
}

const list = async (req: Request, res: Response) => {
    const data: any = await Joi.object().keys({
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        order_by: Joi.string().default('id'),
        reverse: Joi.boolean(),
    }).validateAsync(req.query)

    return routeResSuccess(res, await UserController.list(data))
}

const userLike = async (req: Request, res: Response) => {
    const data: any = await Joi.object().keys({
        type: Joi.number().required(),
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        order_by: Joi.string().default('id'),
        reverse: Joi.boolean(),
    }).validateAsync(req.query)

    data.user_id = res.locals.userId

    return routeResSuccess(res, await UserController.userLike(data))
}

const listLike = async (req: Request, res: Response) => {
    const data: any = await Joi.object().keys({
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        order_by: Joi.string().default('id'),
        reverse: Joi.boolean(),
    }).validateAsync(req.query)

    data.user_id = res.locals.userId

    return routeResSuccess(res, await UserController.listLike(data))
}

const like = async (req: Request, res: Response) => {
    const data: any = await Joi.object().keys({
        user_id: Joi.number().required()
    }).validateAsync(req.body)

    data.user_like = res.locals.userId || 3

    return routeResSuccess(res, await UserController.like(data))
}

const trending = async (req: Request, res: Response) => {
    const data: any = await Joi.object().keys({
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        order_by: Joi.string(),
        reverse: Joi.boolean(),
    }).validateAsync(req.query)

    return routeResSuccess(res, await UserController.trending(data))

}

const search = async (req: Request, res: Response) => {
    const data: any = await Joi.object().keys({
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        order_by: Joi.string(),
        reverse: Joi.boolean(),
        age_from: Joi.number().optional(),
        age_to: Joi.number().optional(),
        city: Joi.number().optional(),
        favorite: Joi.array().optional(),
        gender: Joi.number().optional()
    }).validateAsync(req.body)

    return routeResSuccess(res, await UserController.search(data))

}

const update = async (req: Request, res: Response) => {
    const data = await Joi.object().keys({
        mobile: Joi.number().integer().allow(null, ''),
        gender: Joi.number().allow(null, ''),
        fullname: Joi.string().allow(null, ''),
        avatar: Joi.string().allow(null, ''),
        description: Joi.string().allow(null, ''),
        height: Joi.number().allow(null, ''),
        weight: Joi.number().allow(null, ''),
        job: Joi.string().allow(null, ''),
        age: Joi.number().allow(null, ''),
        city: Joi.string().allow(null, ''),
        marital_status: Joi.number().allow(null, ''),
        description_desire: Joi.string().allow(null, ''),
        description_info: Joi.string().allow(null, ''),
        hobby: Joi.string().allow(null, ''),
        language: Joi.string().allow(null, ''),
        academy_level: Joi.string().allow(null, ''),
    }).validateAsync(req.body)

    data.user_id = res.locals.userId

    return routeResSuccess(res, await UserController.update(data, res.locals.userId))
}
export const UserRoute = (app: Application) => {
    const router = Router();
    app.use("/user", router);

    router.get("/get", hpr(get));
    router.get("/list", hpr(list))
    router.get("/list-like", checkAuth, hpr(userLike))
    router.post("/like", checkAuth, hpr(like))
    router.get("/trending", hpr(trending));
    router.post("/search", hpr(search));
    router.get("/list-like-user", checkAuth, hpr(listLike));
    router.post("/update", checkAuth,  hpr(update));
}
