const mongoose = require('mongoose');

const allowedTaskStatuses = ['todo', 'in-progress', 'done'];
const allowedTaskPriorities = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: {
        values: allowedTaskStatuses,
        message: `Status must be one of: ${allowedTaskStatuses.join(', ')}`
      },
      default: 'todo',
      trim: true
    },
    priority: {
      type: String,
      enum: {
        values: allowedTaskPriorities,
        message: `Priority must be one of: ${allowedTaskPriorities.join(', ')}`
      },
      default: 'medium',
      trim: true
    },
    dueDate: {
      type: Date,
      default: null
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

taskSchema.index({ projectId: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
module.exports.allowedTaskStatuses = allowedTaskStatuses;
module.exports.allowedTaskPriorities = allowedTaskPriorities;
