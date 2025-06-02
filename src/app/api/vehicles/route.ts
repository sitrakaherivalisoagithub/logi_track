import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Vehicle } from '@/models/vehicle';

export async function GET() {
  try {
    await connectToDatabase();
    const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
    return NextResponse.json(vehicles);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const vehicle = await Vehicle.create(body);
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A vehicle with this plate number already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create vehicle' },
      { status: 500 }
    );
  }
} 