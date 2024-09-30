import prisma from '@/lib/prisma';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error(
      'Webhook Error:',
      error instanceof Error ? error.message : error
    );
    return new NextResponse(
      `Webhook Error: ${error instanceof Error ? error.message : 'Unknown Error'}`,
      {
        status: 400,
      }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId;
  const courseId = session.metadata?.courseId;

  switch (event.type) {
    case 'checkout.session.completed':
      if (!userId || !courseId) {
        console.error('Webhook Error: Missing Metadata', { userId, courseId });
        return new NextResponse('Webhook Error: Missing Metadata', {
          status: 400,
        });
      }

      try {
        await prisma.purchase.create({
          data: {
            courseId,
            clerkId: userId,
          },
        });
        console.log('Purchase recorded successfully.');
      } catch (error) {
        console.error('Error saving purchase to database:', error);
        return new NextResponse('Error saving purchase.', { status: 500 });
      }
      break;

    case 'payment_intent.succeeded':
      console.log(`PaymentIntent ${session.id} succeeded!`);
      break;

    case 'payment_intent.created':
      console.log(`PaymentIntent ${session.id} created.`);
      break;

    case 'charge.succeeded':
      console.log(`Charge for ${session.id} succeeded.`);
      break;

    case 'charge.updated':
      console.log(`Charge for ${session.id} updated.`);
      break;

    default:
      console.warn(`Webhook Error: Unhandled Event Type ${event.type}`);
      return new NextResponse(
        `Webhook Error: Unhandled Event Type ${event.type}`,
        { status: 400 }
      );
  }

  return new NextResponse(null, { status: 200 });
}
