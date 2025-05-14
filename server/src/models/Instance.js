const mongoose = require('mongoose');

const instanceSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    enum: ['aws', 'azure', 'gcp']
  },
  instanceType: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  specs: {
    vCPUs: {
      type: Number,
      required: true
    },
    memory: {
      type: Number,
      required: true
    },
    storage: {
      type: Number,
      required: true
    },
    gpu: {
      type: Boolean,
      default: false
    },
    gpuType: String,
    gpuCount: Number
  },
  pricing: {
    onDemand: {
      type: Number,
      required: true
    },
    reserved: {
      type: Number
    },
    spot: {
      type: Number
    }
  },
  category: {
    type: String,
    enum: ['general', 'compute', 'memory', 'storage', 'gpu'],
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
instanceSchema.index({ provider: 1, instanceType: 1, region: 1 }, { unique: true });
instanceSchema.index({ 'specs.vCPUs': 1, 'specs.memory': 1 });
instanceSchema.index({ category: 1 });
instanceSchema.index({ lastUpdated: 1 });

const Instance = mongoose.model('Instance', instanceSchema);

module.exports = Instance; 