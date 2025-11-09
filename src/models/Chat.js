const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  senderRole: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  content: { 
    type: String, 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

const ChatSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // Un usuario solo puede tener un chat
  },
  messages: [MessageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, { timestamps: true });

// Índices para búsquedas rápidas
ChatSchema.index({ user: 1 });
ChatSchema.index({ lastMessage: -1 });
ChatSchema.index({ status: 1 });

module.exports = mongoose.model('Chat', ChatSchema);
