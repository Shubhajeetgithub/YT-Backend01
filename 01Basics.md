# Connecting **frontend** and **backend**

1) Create two directories: frontend and backend
2) Open terminal in backend directory and type
```bash
npm init
```
3) Go to backend/package.json file and inside "scripts" add this- "start": "node index.js"
4) Again open terminal in backend directory and type
```bash
npm install express
```
5) Go to backend/index.js write this
```javascript
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Backend is running');
}
);
app.get('/api/myBackend', (req, res) => {
    const backData = [
        //write some data here
    ];
    res.send(backData);
});
app.listen(port, () => {
    console.log(`Backend is running on http://localhost:${port}`);
}
);
```
6) Open terminal in frontend directory and type this
```bash
npm create vite@latest .
```
```bash
npm install
```
7) Go to frontend/vite.config.js and type this before plugins -
server: {
    proxy: {
        '/api': 'http://localhost:3000'
    }
}
8) In frontend terminal type this
```bash
npm install axios
```
9) Go to frontend/App.jsx and type this
```javascript
import axios from 'axios'
import { useState, useEffect } from 'react'
function App() {
    const [backData, setBackData] = useState([])
    useEffect(() => {
        axios.get('/api/myBackend')
        .then((res) => {
            setBackData(res.data)
        })
        .catch((err) => {
            console.log(err)
        })
    })
    return (
        <>
            <h1>{backData}</h1>
        </>
    )
}
export default App

```
10) Type in backend terminal
```bash
npm run start
```
and in frontend terminal type
```bash
npm run dev
```

11) Some less-related info

### Summary: Backticks, Curly Braces, and Dollar Sign in JavaScript and JSX

| Symbol        | Used in         | Purpose                              | Example                                |
|---------------|------------------|---------------------------------------|----------------------------------------|
| `` `...` ``   | JavaScript       | Template literal (string with `${}`) | `` `Hello, ${name}` ``                |
| `${...}`      | Inside backticks | Expression interpolation              | `` `Age: ${user.age}` ``              |
| `{...}`       | JSX              | Embed JS expressions into JSX         | `<p>{user.name}</p>`                  |

---

### Usage Notes

- **Backticks (`)**: Use in JavaScript when you need string interpolation or multi-line strings.
- **Dollar Sign with Curly Braces (`${}`)**: Use inside backticks to embed JavaScript expressions into a string.
- **Curly Braces (`{}`)**: Use in JSX to insert JavaScript expressions into HTML-like syntax.