'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryId = params.id;
    if (!deliveryId) {
      return NextResponse.json({ message: 'Delivery ID is required' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('deliveries').deleteOne({ _id: new ObjectId(deliveryId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Delivery not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Delivery deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete delivery:', error);
    return NextResponse.json({ message: 'Failed to delete delivery' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryId = params.id;
    if (!deliveryId) {
      return NextResponse.json({ message: 'Delivery ID is required' }, { status: 400 });
    }
    const updates = await request.json();
    const db = await getDb();
    const result = await db.collection('deliveries').findOneAndUpdate(
      { _id: new ObjectId(deliveryId) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      return NextResponse.json({ message: 'Delivery not found' }, { status: 404 });
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (error) {
    console.error('Failed to update delivery:', error);
    return NextResponse.json({ message: 'Failed to update delivery' }, { status: 500 });
  }
}
