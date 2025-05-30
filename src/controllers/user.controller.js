import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js" 

const registerUser = asyncHandler( async (req, res) => {

    // 1. Get user details from frontend
    const { fullName, email, username, password } = req.body;
    
    // 2. Validating the entries
    const fields = { fullName, email, username, password };
    Object.entries(fields).forEach(([key, value]) => {
        if (!value || value.trim() === "") {
            throw new ApiError(400, `${key} is required`);
        }
    });

    // 3. Check if the user already exists or not
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    });
    if (existedUser) {
        throw new ApiError(400, "User already exists.")
    }

    // 4. Check if avatar field is empty or not.
    if (!req.files || !req.files.avatar || req.files.avatar.length === 0) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 5. Upload images to Cloudinary
    const avatarLocalPath = req.files.avatar[0].path;
    let coverImageLocalPath = null;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // check if avatarLocalPath and coverImageLocalPath are same or not
    if (avatarLocalPath === coverImageLocalPath) {
        throw new ApiError(400, "Avatar and cover image file must be different");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // 6. Create user object and an entry in the database.
    const user = await User.create({
        fullName: fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email: email,
        password: password,
        username: username.toLowerCase()
    })

    // 7. Remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    // 8. Check if user is successfully created or not
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // 9. Return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export default registerUser;