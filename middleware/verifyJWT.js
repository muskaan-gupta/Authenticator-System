import jwt from "jsonwebtoken";
import { asynchandler } from "../asynchandler.js";
import { User } from "../models/user.js";
import { ApiError } from "../apierror.js";

const verifiedJWT = asynchandler(async (req, _, next) => {
  try {
    const aToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!aToken) throw new ApiError(401, "Unauthorized Access");

    const decodedToken = jwt.verify(aToken, process.env.ACCESS_TOKEN_SECRET);
    const currentUser = await User.findById(decodedToken._id);

    if (!currentUser) throw new ApiError(401, "Invalid Access Token");

    req.user = currentUser;
    next();
  } catch (error) {
    next(new ApiError(401, error?.message || "Invalid access token"));
  }
});

export { verifiedJWT };
