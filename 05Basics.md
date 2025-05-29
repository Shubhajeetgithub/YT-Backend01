# Defining database structure

Inside src directory, create a directory named models inside which files **user.model.js** and **video.model.js**.

For defining entries of the database this is the template
```javascript
import mongoose from "mongoose";
const videoSchema = new mongoose.Schema({
    //define your columns here
}, {timeseries: true});
export const Video = mongoose.model("Video", videoSchema);
```

In user.model.js write this
```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, //cloudinary url
        required: true
    },
    coverImage: {
        type: String //cloudinary url
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    }, 
    refreshToken: {
        type: String
    }
}, {timestamps: true})

export const User = mongoose.model("User", userSchema)
```

and in video.model.js write this
```javascript
import mongoose from "mongoose";
const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String, //cloudinary url
        required: true
    },
    thumbnail: {
        type: String, //cloudinary url
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timeseries: true});
export const Video = mongoose.model("Video", videoSchema);
```

# Hashing password

Install bcrypt and jsonwebtoken
```bash
npm install bcrypt jsonwebtoken
```
In user.model.js add these
```javascript
import bcrypt from "bcrypt";

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

```
Go to .env file and add these lines
```bash
ACCESS_TOKEN_SECRET=37fdcdc904600c788da6d8dacbbc5ca4099122e5792ff32249427b8447dea05
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=ef0b9ac657f8d7daf2a479455e666617e3270b89b170b42f0a1084363e082dc
REFRESH_TOKEN_EXPIRY=10d
```
(To generate tokens you can use SHA256 generator. Just google and enter your key to convert it into SHA256 hash.)

Again in user.model.js add these lines
```javascript
import jwt from "jsonwebtoken";

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
```