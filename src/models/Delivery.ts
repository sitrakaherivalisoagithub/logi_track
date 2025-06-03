import mongoose, { Document, Schema, models } from 'mongoose';

// Define the interface for plain Delivery data
export interface IDeliveryData {
  date: string; // YYYY-MM-DD format
  client: string;
  departureLocation: string;
  destination: string;
  goods: string;
  weightKg: number;
  pricePerKg: number;
  totalAriary: number;
  vehicle?: Schema.Types.ObjectId | string; // Allow string for input, ObjectId for DB
  // Timestamps are handled by Mongoose, _id by MongoDB
}

// Define the interface for a Delivery document (includes Mongoose Document properties)
export interface IDelivery extends IDeliveryData, Document {
  _id: Schema.Types.ObjectId; // Explicitly define _id for clarity
  createdAt: Date; // Mongoose adds these
  updatedAt: Date; // Mongoose adds these
}

// Define the schema fields based on IDeliveryData
// Let Mongoose infer types for schema fields from this plain object
const deliverySchemaFields = {
  date: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format',
    },
  },
  client: {
    type: String,
    required: true,
    trim: true,
  },
  departureLocation: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  goods: {
    type: String,
    required: true,
    trim: true,
  },
  weightKg: {
    type: Number,
    required: true,
    min: 0,
  },
  pricePerKg: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAriary: {
    type: Number,
    required: true,
    min: 0,
  },
  vehicle: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    // required: false, // It's optional in IDeliveryData, API will handle if it's missing when it should be there
  },
};

const deliverySchema = new mongoose.Schema(deliverySchemaFields, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
  toJSON: { virtuals: true }, // Ensure virtuals like 'id' are included in JSON output
  toObject: { virtuals: true } // Ensure virtuals are included when converting to a plain object
});

// Create a compound index for efficient querying
deliverySchema.index({ date: 1, client: 1 });
deliverySchema.index({ vehicle: 1 }); // Index for vehicle lookups

// Ensure the model is only created once
// The model uses IDelivery which includes Document, but the schema is based on IDeliveryData
export const Delivery = models.Delivery || mongoose.model<IDelivery>('Delivery', deliverySchema);
