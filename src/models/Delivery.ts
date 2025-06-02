import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  client: {
    type: String,
    required: true,
    trim: true
  },
  departureLocation: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  goods: {
    type: String,
    required: true,
    trim: true
  },
  weightKg: {
    type: Number,
    required: true,
    min: 0
  },
  pricePerKg: {
    type: Number,
    required: true,
    min: 0
  },
  totalAriary: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual id field
deliverySchema.virtual('id').get(function() {
  return this._id.toString();
});

// Create a compound index for efficient querying
deliverySchema.index({ date: 1, client: 1 });

// Ensure the model is only created once
export const Delivery = mongoose.models.Delivery || mongoose.model('Delivery', deliverySchema); 