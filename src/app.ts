import express from 'express'
import cookie from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import apiRoutes from './routes'

dotenv.config()

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookie())
app.use(morgan('dev'))

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [process.env.DEVELOPMENT_URL];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true
}));

app.use('/api/v1', apiRoutes)

export default app