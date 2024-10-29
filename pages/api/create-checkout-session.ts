import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { invoice } = req.body;

      if (!invoice || !invoice.items || invoice.items.length === 0) {
        return res.status(400).json({ message: 'Invalid invoice data' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: invoice.items.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.description,
            },
            unit_amount: Math.round(item.price * 100), // Stripe uses cents
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${req.headers.origin}/invoice/${invoice.id}?success=true`,
        cancel_url: `${req.headers.origin}/invoice/${invoice.id}?canceled=true`,
      });

      res.status(200).json({ id: session.id });
    } catch (err: any) {
      console.error('Stripe error:', err);
      res.status(500).json({ message: err.message || 'An error occurred' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
