import { Router } from "express";
import {
    addFriendController,
    deleteUserAccountController,
    getCurrentUserController,
    removeFriendController,
    searchUsersController,
    updateUserController,
    updateUserPasswordController,
} from "../controllers/user.controller";
import isLogin from "../middlewares/auth.middleware";

// express router instance declaration.
const router = Router();

router.route('/get-current-user').get(isLogin, getCurrentUserController);

router.route('/update-user').patch(isLogin, updateUserController);

router.route('/update-password').patch(isLogin, updateUserPasswordController);

router.route('/delete-account').post(isLogin, deleteUserAccountController);

router.route('/search-users').get(isLogin, searchUsersController);

router.route('/add-friend').put(isLogin, addFriendController);

router.route('/remove-friend').put(isLogin, removeFriendController);


export default router;