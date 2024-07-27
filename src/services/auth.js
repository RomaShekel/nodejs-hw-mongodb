import createHttpError from "http-errors";
import { UsersCollection } from "../db/model/users.js";
import { SessionsCollection } from '../db/model/sessions.js';
import bcrypt from 'bcrypt'
import { FIFTEEN_MINUTES, ONE_DAY, SMTP } from '../constants/index.js';
import { randomBytes } from "crypto";
import handlebars from 'handlebars';
import jwt from 'jsonwebtoken'
import { env } from '../utils/env.js';
import path from "node:path"
import fs from "fs/promises"
import { sendMail } from "../utils/sendMail.js";
import { TEMPLATES_DIR } from "../constants/index.js";


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

export const requestResetToken = async (email) => {
    const user = await UsersCollection.findOne({email:email});

    if (!user) {
        throw createHttpError(404, 'User not found!');
    }

    const resetToken = jwt.sign(
        {
            sub:user._id,
            email,
        },
        env('JWT_SECRET'),
        {
            expiresIn:'5m'
        },
    )

    const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',)

    const templateSource = (await fs.readFile(resetPasswordTemplatePath)).toString()

    const template = handlebars.compile(templateSource)
    const html = template({
        name:user.name,
        link: `${env('APP_DOMAIN')}/reset-pwd?token=${resetToken}`
    });

    try {
    await sendMail({
        from: env(SMTP.SMTP_FROM),
        to: email,
        subject:'Reset your password',
        html,
    })
    }  catch (err) {
        throw createHttpError(500, "Failed to send the email, please try again later.")
    };
}

export const resetPassword = async (payload) => {
    let entries;

    try {
        entries = jwt.verify(payload.token, env('JWT_SECRET'));
    } catch (err) {
        if (err instanceof Error) throw createHttpError(401, "Token is expired or invalid.");
    throw err;
    }

    const user = await UsersCollection.findOne(
        {
            email:entries.email,
            _id:entries.sub,
        })

    if(!user){
        throw createHttpError(404,'User not found')
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10)

    await UsersCollection.findOneAndUpdate(
        {_id:user.id},
        {password: encryptedPassword},
    )

    await SessionsCollection.findOneAndDelete({userId: user._id})
}