import mongoose, { Document, Schema, models } from 'mongoose';

export interface IVehicle extends Document {
  brand: string;
  plateNumber: string;
  maxPayloadKg: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    brand: {
      type: String,
      required: [true, 'Vehicle brand is required.'],
      trim: true,
    },
    plateNumber: {
      type: String,
      required: [true, 'Vehicle plate number is required.'],
      unique: true,
      trim: true,
    },
    maxPayloadKg: {
      type: Number,
      required: [true, 'Maximum payload in kg is required.'],
      min: [0, 'Maximum payload cannot be negative.'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Ensure the model is not recompiled if it already exists
const Vehicle = models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);

export default Vehicle;
