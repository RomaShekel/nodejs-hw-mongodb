import createHttpError from "http-errors";
import { UsersCollection } from "../db/model/users.js";
import { SessionsCollection } from '../db/model/sessions.js';
import bcrypt from 'bcrypt'
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';
import { randomBytes } from "crypto";
import { Session } from "inspector";


const createSession = () => {
    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil:new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil:new Date(Date.now() + ONE_DAY),
    }
}

export const registerUser = async (payload) => {
    const user = await UsersCollection.findOne({email:payload.email})
    if(user) throw createHttpError(409, 'Email in use')

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    return await UsersCollection.create({
        ...payload,
        password: encryptedPassword,
    })
}

export const loginUser = async (payload) => {
    const user = await UsersCollection.findOne({email: payload.email});

    if(!user) {
        throw createHttpError(401, 'User not found')
    };

    const isEqual = await bcrypt.compare(payload.password, user.password);

    if(!isEqual) throw createHttpError(401, 'Wrong password!');

    await SessionsCollection.deleteOne({userId: user._id})

    const newsSession = createSession();

    return await SessionsCollection.create({
        userId:user._id,
        ...newsSession,
    });
}

export const refreshUserSession = async (sessionId, refreshToken) => {
    const session = await SessionsCollection.findOne({_id:sessionId, refreshToken: refreshToken});
    if(!session) throw createHttpError(401, 'Not found a session');

    const isSessionTokenExpire = new Date() > new Date(session.refreshTokenValidUntil);

    if(isSessionTokenExpire) throw createHttpError(401, 'Session token has expired');

    const newSession = createSession();

    await SessionsCollection.deleteOne({_id:sessionId, refreshToken: refreshToken});

    return await SessionsCollection.create({
        userId: session.userId,
        ...newSession,
    })
}

export const logout = async (sessionId) => {
    await SessionsCollection.findByIdAndDelete(sessionId)
}