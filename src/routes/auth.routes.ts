import { Router } from "express";
import {
    forgetPasswordController,
    loginUserController,
    logoutUserController,
    refreshAccessTokenController,
    registerUserController,
    sendOtpController,
    verifyOtpController
} from "../controllers/auth.controller";
import isLogin from "../middlewares/auth.middleware";

// express router instance declaration.
const router = Router();

router.route('/register').post(registerUserController);

router.route('/login').post(loginUserController);

router.route('/logout').post(isLogin, logoutUserController);

router.route('/refresh').post(refreshAccessTokenController);

// auth verification routes

router.route('/send-otp').post(sendOtpController);

router.route('/verify-otp').post(verifyOtpController);

router.route('/forget-password').patch(forgetPasswordController);


export default router;