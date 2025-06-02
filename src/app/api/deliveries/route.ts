'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Delivery } from '@/models/Delivery';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const db = await getDb();
    const deliveries = await db.collection('deliveries').find({}).toArray();
    // Transform the deliveries to include the id field
    const transformedDeliveries = deliveries.map(delivery => ({
      ...delivery,
      id: delivery._id.toString()
    }));
    return NextResponse.json(transformedDeliveries);
  } catch (error) {
    console.error('Failed to read deliveries:', error);
    return NextResponse.json({ message: 'Failed to read deliveries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newDeliveryData = await request.json();
    
    // Validate the data using Mongoose model
    const delivery = new Delivery(newDeliveryData);
    await delivery.validate();

    const db = await getDb();
    const result = await db.collection('deliveries').insertOne(delivery);
    
    return NextResponse.json({ ...delivery.toObject(), _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Failed to add delivery:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Invalid delivery data', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to add delivery' }, { status: 500 });
  }
}
