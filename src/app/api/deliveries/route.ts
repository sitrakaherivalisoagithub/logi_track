
'use server';

import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Delivery } from '@/types/delivery';

const dataDir = path.resolve(process.cwd(), 'data');
const dataFilePath = path.join(dataDir, 'deliveries.json');

async function ensureDataFileAndRead(): Promise<Delivery[]> {
  try {
    await fs.mkdir(dataDir, { recursive: true }); // Ensure data directory exists
  } catch (dirError) {
    // Ignore error if directory already exists, otherwise log
    if ((dirError as NodeJS.ErrnoException)?.code !== 'EEXIST') {
      console.error('Error creating data directory:', dirError);
      // Depending on the error, you might want to throw or handle differently
    }
  }
  
  try {
    await fs.access(dataFilePath); // Check if file exists
  } catch (error) {
    // If file doesn't exist, create it with an empty array
    await fs.writeFile(dataFilePath, JSON.stringify([]), 'utf-8');
    return [];
  }

  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    if (fileContent.trim() === '') { // Handle empty file
        return [];
    }
    return JSON.parse(fileContent) as Delivery[];
  } catch (parseError) {
    console.error("Error parsing deliveries.json:", parseError);
    // If parsing fails, consider returning an empty array or re-initializing the file
    await fs.writeFile(dataFilePath, JSON.stringify([]), 'utf-8'); // Re-initialize to be safe
    return [];
  }
}

export async function GET() {
  try {
    const deliveries = await ensureDataFileAndRead();
    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Failed to read deliveries:', error);
    return NextResponse.json({ message: 'Failed to read deliveries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newDeliveryData: Omit<Delivery, 'id'> & { id?: string } = await request.json();
    
    const newDelivery: Delivery = {
      ...newDeliveryData,
      id: newDeliveryData.id || crypto.randomUUID(), // Ensure ID is present
    };

    const deliveries = await ensureDataFileAndRead();
    deliveries.push(newDelivery);
    await fs.writeFile(dataFilePath, JSON.stringify(deliveries, null, 2), 'utf-8');
    return NextResponse.json(newDelivery, { status: 201 });
  } catch (error) {
    console.error('Failed to add delivery:', error);
    return NextResponse.json({ message: 'Failed to add delivery' }, { status: 500 });
  }
}
