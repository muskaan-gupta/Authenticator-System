import dotenv from "dotenv";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import { asynchandler } from "../asynchandler.js";

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

class ApiResponse {
  constructor(status, data, message) {
    this.status = status;
    this.data = data;
    this.message = message;
  }
}

const registerUser = async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;

    if (!username) throw new ApiError(400, "UserName is required");
    if (!fullname) throw new ApiError(400, "FullName is required");
    if (!email) throw new ApiError(400, "Email is required");
    if (!password) throw new ApiError(400, "Password is required");

    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existedUser)
      throw new ApiError(409, "User with email or username already exists");

    const hashedPassword = await bcrypt.hash(password, 10); // Encrypt password

    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      username,
    });

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) throw new ApiError(500, "Not able to register the user");

    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
      createdUser._id
    );

    const options = {
      secure: true,
      sameSite: "None",
      httpOnly: true,
    };
    res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options);
    return res
      .status(200)
      .json(new ApiResponse(200, createdUser, "Successful Registration"));
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};
//this fun generates access and refresh token during the fresh login
const generateAccessandRefreshTokens = async (userid) => {
  try {
    const user = await User.findById(userid);

    const accessToken = await user.generateAccessTokens();
    if (!accessToken) throw new ApiError(500, "Can't generate access token");
    const refreshToken = await user.generateRefreshTokens();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const loginUser = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");

  const currentUser = await User.findOne({ email });
  if (!currentUser) throw new ApiError(400, "Unknown User");

  // Verify password
  const correctPassword = await currentUser.isPasswordCorrect(password); // Make sure this method exists
  if (!correctPassword) throw new ApiError(400, "Incorrect password");

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    currentUser._id
  );

  // Set cookie options for security
  const options = {
    secure: true,
    sameSite: "None",
    httpOnly: true,
  };

  // Get updated user data without sensitive fields
  const updatedloggedinUser = await User.findById(currentUser._id).select(
    "-password -refreshTokens"
  );

  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedloggedinUser, "Logged in successfully"));
});

const logOutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User LoggedOut SuccessFully"));
});

const refreshAccessToken = asynchandler(async (req, res) => {
  const newRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!newRefreshToken) throw new ApiError(401, "No user Found");

  const verifiedToken = jwt.verify(
    newRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(verifiedToken?._id);
  if (!user) throw new ApiError(401, "Unauthorised Access");
  if (newRefreshToken !== user?.refreshToken)
    throw new ApiError(401, "Refresh Toeken has been used");

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    user._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed"
      )
    );
});

export { registerUser, loginUser, logOutUser, refreshAccessToken };
