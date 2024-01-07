import { Router } from "express";
import {
    addUserToTheGroupController,
    createConversationController,
    createGroupController,
    deleteConversationController,
    getAllConversationsController,
    leaveGroupController,
    removeUserFromTheGroupController,
    updateGroupInfoController,
} from "../controllers/conversation.controller";
import isLogin from "../middlewares/auth.middleware";

// express router instance declaration.
const router = Router();

router.route('/create').post(isLogin, createConversationController);

router.route('/get-all').get(isLogin, getAllConversationsController);

router.route('/delete/:id').delete(isLogin, deleteConversationController);

router.route('/create-group').post(isLogin, createGroupController);

router.route('/leave-group').patch(isLogin, leaveGroupController);

router.route('/group/remove-user').patch(isLogin, removeUserFromTheGroupController);

router.route('/group/add-user').patch(isLogin, addUserToTheGroupController);

router.route('/group/update/:id').put(isLogin, updateGroupInfoController);

export default router;