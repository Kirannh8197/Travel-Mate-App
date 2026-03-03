import express from 'express'
import cors from 'cors'
import connectDb from './config/db.config.js'

connectDb();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/employee",);

async function startServer() {
    const PORT = 1234;
    app.listen(PORT, () => {console.log("server running on the port: http://localhost:1234")        
    })
}

startServer();