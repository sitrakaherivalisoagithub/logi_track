import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Vehicle } from '@/models/vehicle';

export async function GET() {
  try {
    const db = await getDb();
    const vehicles = await db.collection('vehicles').find({}).sort({ createdAt: -1 }).toArray();
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
    const db = await getDb();
    const body = await request.json();
    
    const result = await db.collection('vehicles').insertOne(body);
    const vehicle = await db.collection('vehicles').findOne({ _id: result.insertedId });
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