import Router from "express";
import { verifiedJWT } from "../middleware/verifyJWT.js";
import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
} from "../controller/usercontroller.js";

const router = Router();

router.route("/register").post();
router.route("/login").post(loginUser);
router.route("/logout").post(verifiedJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
