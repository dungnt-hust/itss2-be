import { Application, Router } from "express";
import { hpr, routeResSuccess } from "../utils";
import Joi from "joi";
import { GroupController } from "../controllers";
import { checkAuth } from "../middlewares";

const listMyGroup = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            // group_id: Joi.number().required(),
            search: Joi.string().allow(null, ""),
            limit: Joi.number().integer(),
            offset: Joi.number().integer(),
            order_by: Joi.string(),
            reverse: Joi.boolean(),
        })
        .validateAsync({ ...req.query, ...req.params, ...req.body });
    routeResSuccess(res, await GroupController.listMyGroup({ ...reqData, user_id: res.locals.userId }));
};

const get = async (req: any, res: any) =>{
    const data = await Joi.object()
        .keys({
            id: Joi.number().required()
        })
        .validateAsync(req.query)
    data.user_id = res.locals.userId
    routeResSuccess(res, await GroupController.get(data))
}

const create = async (req: any, res: any) => {
    const data = await Joi.object()
        .keys({
            user_id: Joi.number().required()
        }).validateAsync(req.body)
    data.me = res.locals.userId

    routeResSuccess(res, await GroupController.create(data))
}

export const GroupRoute = (app: Application) => {
    const authRouter = Router();
    app.use("/group", checkAuth, authRouter);
    // Children
    authRouter.get("/list", checkAuth, hpr(listMyGroup));
    authRouter.get("/get", checkAuth, hpr(get));
    authRouter.get("/create", checkAuth, hpr(create));
};
