import {Application, Request, Response, Router} from "express"
import {ErrorCode, hpr, routeResSuccess, Utils} from "../utils"
import Joi from "joi"
import {ChatController} from "../controllers";
import {checkAuth} from "../middlewares";


const getList = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            group_id: Joi.number().required(),
            ...Utils.baseFilter
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    routeResSuccess(res, await ChatController.list({...reqData, user_id: res.locals.userId}));
};
const chat = async (req: any, res: any) => {
    const reqData = await Joi.object()
        .keys({
            group_id: Joi.number().required(),
            content: Joi.string().max(280).allow(null ,''),
            image: Joi.array().items(Joi.string()).max(4).allow(null),
            gif: Joi.object().allow(null)
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    if (!reqData.content && !reqData.image && !reqData.gif) throw ErrorCode.UPDATE_ZERO_FIELD;
    console.log(reqData.content)

    routeResSuccess(res, await ChatController.chat(res.locals.userId, reqData));
};

const edit = async (req: Request, res: Response) => {
    const data: any = await Joi.object()
        .keys({
            chat_id: Joi.number().required(),
            content: Joi.string().max(280).allow(null, ""),
            image: Joi.array().items(Joi.string()).max(4).allow(null),
            gif: Joi.object().allow(null)
        })
        .validateAsync({...req.query, ...req.params, ...req.body});
    console.log(data.image)
    if (!data.message && !data.image && !data.gif) throw ErrorCode.UPDATE_ZERO_FIELD;

    return routeResSuccess(res, await ChatController.edit(data));
};

const deleteChat = async (req: Request, res: Response) => {
    const data: any = await Joi.object()
        .keys({
            chat_id: Joi.number().required(),
        })
        .validateAsync(req.body);
    data.user_id = res.locals.userId

    return routeResSuccess(res, await ChatController.deleteChat(data));
};

export const ChatRoute = (app: Application) => {
    const authRouter = Router()
    app.use("/chat", checkAuth, authRouter)
    // Children
    authRouter.get("/list",checkAuth, hpr(getList));
    authRouter.post("/chat",checkAuth, hpr(chat));
    authRouter.put("/edit",checkAuth, hpr(edit));
    authRouter.put("/delete",checkAuth, hpr(deleteChat));
}

