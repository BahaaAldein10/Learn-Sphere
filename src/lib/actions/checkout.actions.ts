'use server';

import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import prisma from '../prisma';
import { stripe } from '../stripe';

interface CheckoutParams {
  userId: string;
  courseId: string;
}

export async function Checkout(params: CheckoutParams) {
  try {
    const { userId, courseId } = params;

    const user = await currentUser();
    if (!user) {
      return { error: 'User not logged in.' };
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      },
    });
    if (!course) {
      throw new Error('Course not found or not available for purchase.');
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        clerkId_courseId: {
          clerkId: userId,
          courseId,
        },
      },
    });
    if (purchase) {
      return { error: 'You have already purchased this course.' };
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.name,
          },
          unit_amount: Math.round((course.price as number) * 100),
        },
        quantity: 1,
      },
    ];

    let stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        stripeCustomerId: true,
      },
    });

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses?.[0]?.emailAddress,
      });

      stripeCustomer = await prisma.stripeCustomer.create({
        data: {
          clerkId: userId,
          stripeCustomerId: customer.id,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}?canceled=1`,
      metadata: {
        courseId,
        userId: user.id,
      },
    });

    return { success: true, sessionUrl: session.url };
  } catch (error) {
    console.log('Error during checkout:', error);
    return { error: 'Failed to initiate checkout. Please try again.' };
  }
}
