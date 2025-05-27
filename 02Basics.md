# Using **Mongoose** for backend

1) In backend terminal type 
```bash
npm install mongoose
```
2) Inside backend create a directory myModel and inside it a file user.model.js
3) Write this in the file user.model.js
```javascript
import mongoose from "mongoose"
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "password is required"]
        }
    }, {timestamps: true}
)

export const User = mongoose.model("User", userSchema)

```
4) Create a file named todo.model.js and inside it write
```javascript
import mongoose from "mongoose"
const todoSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        complete: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        subTodos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubTodo"
            }
        ]
    }, {timestamps: true}
)

export const Todo = mongoose.model("Todo", todoSchema)

```