import {config} from "../config"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import PasswordValidator from 'password-validator'
import {MathUtils} from "./math-utils"
import {TokenType} from "./enum";
import crypto from "crypto";

// --- Create password validator schema
const schema = new PasswordValidator();
schema.is().min(8).is().max(50).not().spaces();


const passwordMethod = (val: any, helpers: any) => {
    const valid = schema.validate(val)
    if (!valid) {
        return helpers.message(
            'Password must have 8-50 characters with no spaces'
        )
    }
    return val
}

const hashPassword = async (password: string) => {
    return bcrypt.hash(password, 10)
}

export interface iUserToken {
    userId: number,
    timestamp?: number,
    expiresIn?: string,
    type?: TokenType
}

const getUserToken = (data: iUserToken) => {
    return jwt.sign({
        userId: data.userId,
        timestamp: data.timestamp || Date.now(),
        type: data.type
    }, config.jwtSecret, {expiresIn: data.expiresIn || '12h'})
}

const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, config.jwtSecret)
    } catch (error: any) {
        console.log('err verifyToken :', error.message)
    }
}

const comparePassword = async (planePw: string, hashedPw: string) => {
    return bcrypt.compare(planePw, hashedPw)
}

const trimText = (str: string): string => {
    return str.trim().replace(/\s\s+/g, ' ')
}

const arrayToMap = (array: any[], key: string) => {
    const map = new Map()
    for (const item of array) {
        map.set(item[key], item)
    }
    return map
}
const getPriceStep = (instrumentGroup: number, price: string) => {
    return instrumentGroup === 1 ?
        (MathUtils.isLessThan(price, '1000') ? 1 :
            MathUtils.isLessThan(price, '5000') ? 5 :
                MathUtils.isLessThan(price, '10000') ? 10 :
                    MathUtils.isLessThan(price, '50000') ? 50 :
                        MathUtils.isLessThan(price, '100000') ? 100 :
                            MathUtils.isLessThan(price, '500000') ? 500 : 1000) :
        instrumentGroup === 2 ?
            (MathUtils.isLessThan(price, '1000') ? 1 :
                MathUtils.isLessThan(price, '5000') ? 5 :
                    MathUtils.isLessThan(price, '10000') ? 10 :
                        MathUtils.isLessThan(price, '50000') ? 50 : 100) : 5
}
// --- Normalized number
const normalizeNumber = (num: number) => {
    return Number(num.toFixed(8));
};
const sha256 = (str: string) => {
    return crypto.createHash('sha256').update(str).digest('hex');
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateCode = (length: number = 6) => {
    const set = '0123456789';
    let salt = '';
    for (let i = 0; i < length; i++) {
        const p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
};
const generateString = (length: number = 6) => {
    const set = '0123456789abcdefghijklmnoporstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let salt = '';
    for (let i = 0; i < length; i++) {
        const p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
};
export const Utils = {
    hashPassword,
    comparePassword,
    passwordMethod,
    trimText,
    getUserToken,
    verifyToken,
    arrayToMap,
    getPriceStep,
    normalizeNumber,
    sha256,
    getRandomInt,
    generateCode,
    generateString,
}
