import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Stripe from 'stripe'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import parkingSpotRoutes from './routes/parkingSpot.js'
import authRoutes from './routes/auth.js'
import bookingRoutes from './routes/booking.js'
import paymentsRoutes from './routes/payments.js'
import Booking from './models/Booking.js'
import parkingSpotModel from './models/ParkingSpot.js'

// Ensure .env is loaded from this directory regardless of current working directory
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env') })

const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// Stripe webhook: must be before express.json()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' })
const computeAmount = (pricing, durationHours = 1) => {
  const hours = Math.max(1, Number(durationHours) || 1)
  const rate = pricing?.hourlyRate ?? null
  if (rate == null) {
    const daily = pricing?.dailyRate ?? 0
    if (daily) return Number(daily)
    return 0
  }
  return Number(rate) * hours
}
app.post('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return res.status(500).send('Missing STRIPE_WEBHOOK_SECRET')
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const meta = session.metadata || {}
      const spotId = meta.spotId
      const durationHours = Number(meta.durationHours) || 1
      const customerName = meta.customerName
      const customerPhone = meta.customerPhone
      const vehicleNumber = meta.vehicleNumber
      const vehicleType = meta.vehicleType
      const userId = meta.userId || null

      const spot = await parkingSpotModel.findById(spotId)
      if (!spot) {
        console.warn('Webhook: spot not found for session', session.id)
        return res.status(200).send('ok')
      }

      const amount = computeAmount(spot.pricing, durationHours)

      // Attempt to decrement a slot atomically
      const dec = await parkingSpotModel.findOneAndUpdate(
        { _id: spotId, availableSlots: { $gt: 0 } },
        { $inc: { availableSlots: -1 } },
        { new: true }
      )

      if (!dec) {
        // Sold out after payment; refund
        try {
          if (session.payment_intent) {
            await stripe.refunds.create({ payment_intent: session.payment_intent })
          }
        } catch (e) {
          console.warn('Webhook: refund attempt failed:', e)
        }
        return res.status(200).send('sold out, refunded')
      }

      try {
        await Booking.create({
          user: userId || undefined,
          parkingSpot: spotId,
          customerName,
          customerPhone,
          vehicleNumber,
          vehicleType,
          durationHours,
          amount,
          paymentMethod: 'STRIPE',
          paymentStatus: 'paid',
          status: 'confirmed',
          startTime: new Date(),
        })
      } catch (createErr) {
        // Roll back slot on booking fail
        await parkingSpotModel.updateOne({ _id: spotId }, { $inc: { availableSlots: 1 } })
        console.error('Webhook: booking create failed:', createErr)
      }
    }

    res.status(200).send('ok')
  } catch (e) {
    console.error('Stripe webhook handler error:', e)
    res.status(500).send('internal error')
  }
})

// middlewares
app.use(express.json())
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }))

//routes
app.use('/api/parking-spots', parkingSpotRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentsRoutes)

app.get('/',(req,res)=>{
    res.send("API Working")
})

app.listen(port, ()=> console.log('Server started on PORT : '+ port))
