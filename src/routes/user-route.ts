import {Application, json, Request, Response, Router} from "express"
import {ErrorCode, hpr, OtpWay, routeResSuccess} from "../utils"
import Joi, {any} from "joi";
import {UserController} from "../controllers";
import {checkAuth} from "../middlewares";
import {config} from "../config";
import {AuthController} from "../controllers/auth.controller";


const get = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({})
        .validateAsync(req.query)

    return routeResSuccess(res, await UserController.get(res.locals.userId));
}

const hello = async (req: Request, res: Response) => {
    return res.status(200).json({
        message: "ok bay by"
    })
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
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        order_by: Joi.string().default('id'),
        reverse: Joi.boolean(),
    }).validateAsync(req.query)

    data.user_id = res.locals.userId || 3

    return routeResSuccess(res, await UserController.userLike(data))
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

export const UserRoute = (app: Application) => {
    const router = Router();
    app.use("/user", router);

    router.get("/get", checkAuth, hpr(get));
    router.get("/list", hpr(list))
    router.get("/list-like", hpr(userLike))
    router.post("/like", hpr(like))
    router.get("/trending", hpr(trending));
    router.post("/search", hpr(search));
}
