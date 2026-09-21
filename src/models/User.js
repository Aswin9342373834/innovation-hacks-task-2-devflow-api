const mongoose = require('mongoose');

const allowedRoles = ['developer', 'manager', 'designer', 'tester'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email'
      ]
    },
    role: {
      type: String,
      enum: {
        values: allowedRoles,
        message: `Role must be one of: ${allowedRoles.join(', ')}`
      },
      default: 'developer',
      trim: true
    },
    passwordHash: {
      type: String,
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
        delete ret.passwordHash;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      }
    }
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.allowedRoles = allowedRoles;
