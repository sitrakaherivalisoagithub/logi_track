import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Vehicle brand is required'],
    trim: true
  },
  plateNumber: {
    type: String,
    required: [true, 'Plate number is required'],
    unique: true,
    trim: true
  },
  maxPayloadKg: {
    type: Number,
    required: [true, 'Maximum payload is required'],
    min: [0, 'Maximum payload cannot be negative']
  }
}, {
  timestamps: true
});

export const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema); 