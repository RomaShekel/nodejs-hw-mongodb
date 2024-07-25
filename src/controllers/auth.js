import createHttpError from "http-errors";
import { FIFTEEN_MINUTES, ONE_DAY } from "../constants/index.js";
import { 
    registerUser, 
    loginUser,
    refreshUserSession,
    logout,
    requestResetToken,
    resetPassword,
} from "../services/auth.js"

const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
        httpOnly:true,
        expire: new Date(Date.now() + FIFTEEN_MINUTES),
    }),
    res.cookie('sessionId', session._id.toString(), {
        httpOnly:true,
        expire: new Date(Date.now() + ONE_DAY),
    });
}

export const registerUserController = async (req, res) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        status:201,
        message: 'Successfully registered a user!',
        data:user,
    })
}

export const loginUserController = async (req, res) => {
    const session = await loginUser(req.body)

    setupSession(res, session);

    res.json({
        status:200,
        message: "Successfully logged in an user!",
        data: {accessToken:session.accessToken},
    }) 
}

export const refreshUserSessionController = async (req, res) => {
    const sessionId = req.cookies.sessionId;
    const refreshToken = req.cookies.refreshToken

    const session = await refreshUserSession(sessionId, refreshToken)
    setupSession(res, session);

    res.json({
        status:200,
        message:"Successfully refreshed a session!",
        data:{accessToken:session.accessToken},
    })
}

export const logoutController = async (req, res) => {
    if(req.cookies.sessionId){
        await logout(req.cookies.sessionId)
    }

    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');
    res.status(204).send();
}

export const requestResetTokenController = async (req, res) => {
    await requestResetToken(req.body.email);

    res.json({
        status:200,
        message: "Reset password email has been successfully sent.",
        data: {},
    })
}

export const resetPasswordController = async (req, res) => {
    await resetPassword(req.body);

    res.json({
        status:200,
        message:'Password has been successfully reset.'
    })
}