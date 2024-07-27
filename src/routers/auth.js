import { Router } from "express";
import { 
    loginUserController,
    logoutController,
    refreshUserSessionController,
    registerUserController,
    requestResetTokenController,
    resetPasswordController
} from "../controllers/auth.js";
import { validateBody } from "../middlewares/validateBody.js";
import { 
    loginUserSchema,
    registerUserSchema,
    requestResetEmailSchema,
    resetPasswordSchema 
} from "../validation/auth.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";

const router = Router()

router.post(
    '/register', 
    validateBody(registerUserSchema), 
    ctrlWrapper(registerUserController));

router.post(
    '/login', 
    validateBody(loginUserSchema), 
    ctrlWrapper(loginUserController))

router.post(
    '/refresh', 
    ctrlWrapper(refreshUserSessionController));

router.post(
    '/logout', 
    ctrlWrapper(logoutController));

router.post(
    '/send-reset-email', 
    validateBody(requestResetEmailSchema), 
    ctrlWrapper(requestResetTokenController))

router.post(
    '/reset-pwd',
    validateBody(resetPasswordSchema),
    ctrlWrapper(resetPasswordController))


export default router