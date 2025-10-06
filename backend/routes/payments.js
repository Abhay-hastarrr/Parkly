import express from 'express';
import Stripe from 'stripe';
import parkingSpotModel from '../models/ParkingSpot.js';

const router = express.Router();

// Lazily instantiate Stripe after dotenv has loaded in server.js
let stripeClient = null;
const getStripe = () => {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY || '';
    stripeClient = new Stripe(key, { apiVersion: '2024-06-20' });
  }
  return stripeClient;
};

const computeAmount = (pricing, durationHours = 1) => {
  const hours = Math.max(1, Number(durationHours) || 1);
  const rate = pricing?.hourlyRate ?? null;
  if (rate == null) {
    const daily = pricing?.dailyRate ?? 0;
    if (daily) return Number(daily);
    return 0;
  }
  return Number(rate) * hours;
};

// Create a Stripe Checkout Session (server-side only)
router.post('/stripe/checkout', async (req, res) => {
  try {
    // Validate Stripe server secret quickly to avoid vague errors
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('rk_')) {
      return res.status(500).json({ success: false, message: 'Stripe server key not configured correctly. Use a secret key (sk_...) on the backend.' });
    }

    const userId = req.user?.id; // optional (if using authenticateUser)
    const {
      spotId,
      customerName,
      customerPhone,
      vehicleNumber,
      vehicleType,
      durationHours = 1,
    } = req.body || {};

    if (!spotId || !customerName || !customerPhone || !vehicleNumber || !vehicleType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const spot = await parkingSpotModel.findById(spotId);
    if (!spot) return res.status(404).json({ success: false, message: 'Parking spot not found' });

    const amount = computeAmount(spot.pricing, durationHours);
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    let currency = (spot.pricing?.currency || 'INR').toLowerCase();
    // Basic allow-list to avoid unsupported currency errors in dev
    const allowedCurrencies = new Set(['usd','inr','eur','gbp']);
    if (!allowedCurrencies.has(currency)) {
      currency = 'usd';
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Enforce Stripe minimums in smallest currency unit
    const minUnitByCurrency = (c) => {
      switch (c) {
        case 'usd':
        case 'eur':
        case 'gbp':
          return 50; // $0.50, €0.50, £0.50
        case 'inr':
          return 5000; // ₹50.00
        default:
          return 50;
      }
    };
    const unitAmount = Math.max(Math.round(amount * 100), minUnitByCurrency(currency));

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: spot.name || 'Parking Reservation',
              description: `${spot.address?.locality || ''}, ${spot.address?.city || ''}`.trim(),
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/parking?payment=success`,
      cancel_url: `${frontendUrl}/parking?payment=cancelled`,
      metadata: {
        spotId: String(spotId),
        userId: userId ? String(userId) : '',
        customerName,
        customerPhone,
        vehicleNumber,
        vehicleType,
        durationHours: String(durationHours),
        currency,
        amount: String(amount),
      },
    });

    return res.status(200).json({ success: true, data: { url: session.url } });
  } catch (err) {
    console.error('Create Checkout Session error:', err);
    const isProd = process.env.NODE_ENV === 'production';
    const msg = !isProd && err?.message ? err.message : 'Failed to create checkout session';
    return res.status(500).json({ success: false, message: msg });
  }
});

export default router;