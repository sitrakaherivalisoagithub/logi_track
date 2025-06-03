import { NextRequest, NextResponse } from 'next/server';
import Vehicle from '@/models/vehicle';
import mongoose from 'mongoose'; // Import mongoose for error handling
import { connectMongoose } from '@/lib/mongodb'; // Import connectMongoose

// GET all vehicles
export async function GET() {
  await connectMongoose();
  try {
    const vehicles = await Vehicle.find({});
    return NextResponse.json({ success: true, data: vehicles }, { status: 200 });
  } catch (error) {
    const e = error as Error;
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

// POST a new vehicle
export async function POST(request: NextRequest) {
  await connectMongoose();
  try {
    const body = await request.json();
    // Using Vehicle.create() directly handles instantiation and saving.
    // Mongoose validation is automatically run before saving.
    const vehicle = await Vehicle.create(body); 
    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error) {
    const e = error as mongoose.Error; // Cast to mongoose.Error for specific checks
    // Handle potential duplicate key error for plateNumber (code 11000)
    if ((e as any).code === 11000) {
        return NextResponse.json({ success: false, error: 'Vehicle with this plate number already exists.' }, { status: 409 });
    }
    // Handle Mongoose validation errors
    if (e instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ success: false, error: 'Validation failed', errors: e.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
