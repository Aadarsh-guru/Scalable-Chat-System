import { Router } from "express";
import { uploadMediaController } from "../controllers/media.controller";
import isLogin from "../middlewares/auth.middleware";

// express router instance declaration.
const router = Router();

router.route('/upload').post(isLogin, uploadMediaController);


export default router;