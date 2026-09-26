import 'dotenv/config'
import express from 'express'
import cookie from 'cookie-parser'
import cors from 'cors'
import morgan from 'morgan'
import apiRoutes from './routes'
import path from 'path';
import { ApiResponse } from './utils/response';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookie())
app.use(morgan('dev'))

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [process.env.DEVELOPMENT_URL, process.env.PRODUCTION_URL];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true
}));

// Serve generated PDF salary slips (iframe‑friendly)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


app.use((_, res, next) => {
  res.success = (payload: ApiResponse<unknown>) => {
    return res.status(payload.status).json({
      success: payload.success,
      message: payload.message,
      status: payload.status,
      data: payload.data ?? null
    })
  }
  next()
})

app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err?.status ?? 500
  const message = err?.message ?? 'Internal Server Error'

  return res.status(status).json({
    success: false,
    message,
    status,
    data: null
  })
})

app.use('/api/v1', apiRoutes)

export default app