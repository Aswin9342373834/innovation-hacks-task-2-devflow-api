const mongoose = require('mongoose');

const allowedProjectStatuses = ['active', 'completed', 'archived'];

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [120, 'Name cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required']
    },
    status: {
      type: String,
      enum: {
        values: allowedProjectStatuses,
        message: `Status must be one of: ${allowedProjectStatuses.join(', ')}`
      },
      default: 'active',
      trim: true
    },
    progress: {
      type: Number,
      min: [0, 'Progress must be at least 0'],
      max: [100, 'Progress cannot exceed 100'],
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

projectSchema.index({ ownerId: 1 });
projectSchema.index({ status: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
module.exports.allowedProjectStatuses = allowedProjectStatuses;
