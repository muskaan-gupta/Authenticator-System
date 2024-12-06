import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true, //for optimum searching
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    fullname: {
      type: String,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      max: 20,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
  { versionKey: false }
);

//pre is used as a middleware which performs the particuar task before any event that is going to happen.
//here it encrypt the password just before it is saved in db.

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});
//if condition is used that the password is only encrypted when the password is updated or saved. if any other info is changed then password nend not to be encrypted again.
//next moves towards the next middleware.

//Now create a function to check if the password entered is correct or not. for that we need to create a meathod.
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//jwt tokens

userSchema.methods.generateAccessTokens = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshTokens = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
