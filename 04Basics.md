# Connecting MongoDB
Sign up at **MongoDB Atlas**.
Click on Create Deployment. Choose a username and password. Choose a mode say "Compass" and proceed. Copy the URL and paste it in .env file (remove the trailing / from the URL). Next go to Network access section and add this IP address: **0.0.0.0/0**.

Go to src/constants.js file and add this line
```javascript
export const DB_NAME = "videotube"
```
Next install mongoose, express and dotenv
```bash
npm install mongoose express dotenv
```

### Key points to keep in mind while database connection
- Whenever we want to talk to a database, we may encounter problems. So always wrap using `try-catch`. (Or use resolve-reject method from promises)
- *"Database is in another continent"*. So, databases take time to come, hence use `async-await`.

Create a folder inside src directory named **db** and inside it a file index.js. Inside it write this
```javascript
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected !! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log('MongoDB connection error: ', error);
        process.exit(1);
    }
}

export default connectDB;
```
Go to src/app.js file and write this
```javascript
import express from "express"
const app = express()
export default app
```

Now in src/index.js write this
```javascript
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js"
dotenv.config({
    path: '../.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    }) 
})
.catch((err) => {
    console.log("MongoDB connection failed !!!", err);
});
```
and now go to package.json and inside scripts write this: 

"dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"

# CORS and cookies
Now install cookie-parser and cors package
```bash
npm install cookie-parser cors
```
(always open `package.json` to check if any package/dependency is actually installed or not)

Now go to .env file and add this line

CORS_ORIGIN=*

(* means that we are allowing everyone to access)

Now in src/app.js add these lines
```javascript
import cors from "cors"
import cookieParser from "cookie-parser"

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
```
