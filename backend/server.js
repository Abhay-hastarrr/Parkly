import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import parkingSpotRoutes from './routes/parkingSpot.js'
import authRoutes from './routes/auth.js'

// Ensure .env is loaded from this directory regardless of current working directory
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }))

//routes
app.use('/api/parking-spots', parkingSpotRoutes)
app.use('/api/auth', authRoutes)

app.get('/',(req,res)=>{
    res.send("API Working")
})

app.listen(port, ()=> console.log('Server started on PORT : '+ port))
