import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import  User  from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1) get user details from frontend/postman
  console.log("req.body: ", req.body);
  const { name, email, phone, password } = req.body;

  console.log("name: ", name);
  console.log("email: ", email);
  console.log("phone: ", phone);
  console.log("password: ", password);

  // 2) validation: data is not empty and in correct format
  if ([name, email, phone, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // 3) check if user already exists through username and email
  const existedUser = await User.findOne({
    $or: [/*{phone}, */ { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User With email already exist");
  }

  // 4) check for Images, check for avatar using multer
  /*
    console.log("req.files: \n", req.files)
    if(!req.files || !req.files?.avatar || req.files?.avatar?.size == 0)
    {
        throw new ApiError(400, "Avatar required")
    }
    */

  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log("avatarLocalPath: ", avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // 5) upload them(Image, avatar) to cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // 8) now create a user object from the details recieved. This user object to be uploaded on MongoDB i.e. enter the details in database

  const user = await User.create({
    name,
    avatar: avatar.url,
    email,
    password,
    phone,
  });

  // 10) remove password and refresh Token
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 11) check for user creation in database
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  // 12) generate response

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
    // json body response
  );
});

const loginUser = asyncHandler(async (req, res) => {
  /*
    1) req body -> data
    2) username or email, one must be there
    3) find the user
    4) password check
    5) Create access and refresh token
    6) send cookie
    */

  // 1) req body -> data
  console.log("req.body: ", req.body);
  const { name, email, password } = req.body;

  // 2) username or email, one must be there
  if (!name || !email) {
    throw new ApiError(400, "all fields are required");
  }

  // 3) find the user
  const user = await User.findOne({
    $or: [{ email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (name.trim().toLowerCase() !== user.name.trim().toLowerCase()) {
    throw new ApiError(404, "Incorrect Name");
  }

  // 4) password check

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Incorrect password given by user");
  }

  // 5) Create access and refresh token

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // 6) send cookie

  const loggedInUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );

  const options = {
    // to make sure that cookie is edited from the server / backend only and not the frontend (views only)
    httpOnly: true, // JavaScript on frontend cannot read/edit this cookie (protects from XSS). For frontend to read, them, we will use getCurrentUser() function
    secure: true, // Only sent over HTTPS
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken; // setting value of refreshToken for the already created user. this token is now also part of MongoDB database

    await user.save({ validateBeforeSave: false }); //After editing the database by adding refreshToken, save the database. Also, "{validateBeforeSave: false}" is required because while saving, all the must required fields are also triggered i.e. demanding that they should also be present but we confirm that we dont need to enter all that

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went Wrong while generating refresh and access token"
    );
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  /*
    todos:
    step 1: fetch refresh token from user browser
    step 2: throw error if refresh token not recieved
    step 3: Decode the fetched refresh token
    step 4: fetch user from database from the id recieved while decoding and get refresh token held by database. Compare both the refresh token.

    */

  try {
    // step 1: fetch refresh token from user browser
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    /*
        req.body.refreshToken : if refresh token is coming from mobile
        
        Web browser (like Chrome) → refresh token is usually stored in cookies. So, req.cookies.refreshToken will have it.
        
        Mobile app (like Android/iOS apps) → mobile apps don't automatically use cookies well. Instead, mobile apps send refresh token manually inside request body (like in POST JSON data). So, we need to check req.body.refreshToken. ✅ Works fine for mobile too.
        */

    // step 2: throw error if refresh token not recieved
    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    // step 3: Decode the fetched refresh token from browser
    /*
            when decoded data will come out in below format because in this format only we submitted the data i.e. 
        return jwt.sign(
                    {
                        _id: this._id
                    },
                    process.env.REFRESH_TOKEN_SECRET,
                    {
                        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
                    }
                )
        */

    const decodedRefreshToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // jwt.verify() provides decoded token because browser has encrypted token

    const user = await User.findById(decodedRefreshToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    // step 4: fetch user from database from the id recieved while decoding and get refresh token held by database. Compare both the refresh token

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or use");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const [newAccessToken, newRefreshToken] = generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { newAccessToken, refreshToken: newRefreshToken },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Invalid Refresh Token due to some error"
    );
  }
});

// getCurrentUser is used to verify user throught tokens when they again visit the site
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "curret user fetched successfully"));
});

const logoutUser = asyncHandler(async(req, res) =>{
    // Need to reset both access token and refresh token

    // clearing cookie from database
    
    const updated = await User.findByIdAndUpdate(
        req.user._id, // how to search
        {
            $set: {  // what to update
                refreshToken: undefined,
            }
        },
        { // to return new value of refreshToken
            new: true
        }
    )

    //console.log("updated:", updated);

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)  // clearing cookie from browser
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  // changeCurrentPassword,
  getCurrentUser,
  // updateAccountDetails,
  // updateUserAvatar,
  // updateUserCoverImage,
};
