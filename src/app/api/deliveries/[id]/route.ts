
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Delivery } from '@/types/delivery';

const dataDir = path.resolve(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'deliveries.json');

async function readDeliveries(): Promise<Delivery[]> {
  try {
    // Ensure directory exists, though primary creation is in the other route's ensureDataFileAndRead
    await fs.mkdir(dataDir, { recursive: true }).catch(err => {
        if (err.code !== 'EEXIST') throw err;
    });
    await fs.access(dataFilePath);
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
     if (fileContent.trim() === '') { // Handle empty file
        return [];
    }
    return JSON.parse(fileContent) as Delivery[];
  } catch (error) {
    // If file doesn't exist or error reading, return empty array
    // This part of the code assumes the file might not exist if no deliveries were ever added.
    return [];
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryId = params.id;
    if (!deliveryId) {
      return NextResponse.json({ message: 'Delivery ID is required' }, { status: 400 });
    }

    let deliveries = await readDeliveries();
    const initialLength = deliveries.length;
    deliveries = deliveries.filter(delivery => delivery.id !== deliveryId);

    if (deliveries.length === initialLength) {
      return NextResponse.json({ message: 'Delivery not found' }, { status: 404 });
    }

    await fs.writeFile(dataFilePath, JSON.stringify(deliveries, null, 2), 'utf-8');
    return NextResponse.json({ message: 'Delivery deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete delivery:', error);
    return NextResponse.json({ message: 'Failed to delete delivery' }, { status: 500 });
  }
}
