### HTTP basics
| Code | Meaning |
|----------|---------|
| 100 - 199 | Informational |
| 200 - 299 | Success | 
| 300 - 399 | Redirection |
| 400 - 499 | Client error |
| 500 - 599 | Server error |

| HTTP Method | Use Case | Sends data in |
|----------|----------|----------|
| GET | Fetch/search data | URL query |
| POST | Submit/create new data | Body |
| PUT | Replace existing data | Body |
| PATCH | Partially update data | Body |
----------

## Writing registerUser function
For this, we need to implement the following points.
1. Get user details from frontend (we will be using `postman` here instead).
2. Validate the entires, check if they are empty or not.
3. Check if the user already exists or not (by checking if same username or same email already exists in MongoDB).
4. Check if avatar field is empty or not.
5. Upload images to cloudinary.
6. Create user object and an entry in the database.
7. Remove password and refresh token from response
8. Check if user is successfully created or not
9. Return response.

As we need to perform multiple checks, it is better to write the ApiError response and ApiResponse in a seperate file. So go to `src/utils` and create a file named ApiError.js and ApiResponse.js. Inside **ApiError.js** write this
```js
class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors=[],
        stack=""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
```
Inside **ApiResponse.js** write this
```js
class ApiResponse {
    constructor(
        statusCode,
        data,
        message = "Success"
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { ApiResponse }
```

Import these in src/controllers/user.controller.js file
```js
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js" 
```

Now let us implement our requirements.
### 1. Get user details from frontend
----
In src/controllers/user.controller.js where we wrote 
```js
const registerUser = asyncHandler( async (req, res) => {
    // your code here
})
```
| Source of Data | Use this |
|-----------|------------|
| Body of POST/PUT | req.`body`|
| Images/pdfs/videos | req.`files`|
| URL query string | req.query|
| URL route param | req.params|
| Headers | req.headers|
| Cookies | req.cookies|

So, here we write 
```js
const { fullName, email, username, password } = req.body;
```

**Handling images**

Here frontend must use **multipart/form-data** encoding. Also it requires middleware like multer to parse the incoming file.

Navigate to src/routes/user.route.js and add these lines
```js
import {upload} from "../middlewares/multer.middleware.js";

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
```

#### Example structure of req.files
```js
req.files = {
    avatar: [
        {
            fieldname: 'avatar',
            originalname: 'profile.png',
            encoding: '7bit',
            mimetype: 'image/png',
            destination: './uploads/',
            filename: 'abc123.png',
            path: 'uploads/abc123.png',
            size: 43211 //in bytes
        }
    ],
    coverImage: [
        {
            //...fill these similarly
        }
    ]
};
```


### 2. Validating the entries
-----
```js
import {ApiError} from "../utils/ApiError.js";
const fields = { fullName, email, username, password };
Object.entries(fields).forEach(([key, value]) => {
    if (!value || value.trim() === "") {
        throw new ApiError(400, `${key} is required`);
    }
});
```

### 3. Check if the user already exists or not
----------
```js
import { User } from "../models/user.model.js";
const existedUser = await User.findOne({
    $or: [{username}, {email}]
});
if (existedUser) {
    throw new ApiError(400, "User already exists.")
}
```

### 4. Check if avatar field is empty or not.
---------
```js
if (!req.files || !req.files.avatar || req.files.avatar.length === 0) {
    throw new ApiError(400, "Avatar file is required");
}
```

### 5. Upload images to Cloudinary
------------
```js
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
```

### 6. Create user object and an entry in the database.
-----------
```js
const user = await User.create({
    fullName: fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    password: password,
    username: username.toLowerCase()
})
```

### 7. Remove password and refresh token from response
-----------------
```js
const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)
```

### 8. Check if user is successfully created or not
-------------
```js
if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
}
```

### 9. Return response.
-------------
```js
return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
)
```

## Testing eveything

First open terminal and type 
```bash
npm run dev
```
to start the server. Now open `Postman` and enter the url http://localhost:8000/api/v1/users/register select method as POST and go to body and select **form-data**. Now enter the key and value pairs (keys being fullName, username, password, email, avatar, coverImage).

### Some less related points
-------
| Function/Module | Resolves path relative to |
|-------------|------------|
| require / import | 📁 Current file location |
| `multer` | 📁 process.cwd() |
| fs | 📁 process.cwd() |
| cloudinary.uploader.upload | 📁 process.cwd() |