'use server';

import { type NextRequest, NextResponse } from 'next/server';
// import { getDb } from '@/lib/mongodb'; // No longer needed for this file
import { connectMongoose } from '@/lib/mongodb'; // Import connectMongoose
import { Delivery } from '@/models/Delivery';
import mongoose from 'mongoose';

export async function GET() {
  await connectMongoose();
  try {
    // Use Mongoose model to find deliveries
    const deliveries = await Delivery.find({}).sort({ createdAt: -1 }); // Sort by newest first
    return NextResponse.json(deliveries, { status: 200 });
  } catch (error) {
    console.error('Failed to read deliveries:', error);
    const e = error as Error;
    return NextResponse.json({ success: false, message: 'Failed to read deliveries', error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectMongoose();
  try {
    const newDeliveryData = await request.json(); // This includes the 'vehicle' field as a string ID
    
    // Use Mongoose's create method. It handles validation and saving.
    // Mongoose will automatically attempt to cast the 'vehicle' string to ObjectId based on the schema ref.
    const createdDelivery = await Delivery.create(newDeliveryData);
    
    return NextResponse.json(createdDelivery, { status: 201 });
  } catch (error) {
    console.error('Failed to add delivery:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ success: false, message: 'Invalid delivery data', errors: error.errors }, { status: 400 });
    }
    // Handle other potential errors, e.g., database connection issues if Mongoose fails to connect
    return NextResponse.json({ success: false, message: 'Failed to add delivery', error: (error as Error).message }, { status: 500 });
  }
}
