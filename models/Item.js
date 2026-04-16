const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['note', 'image', 'link', 'video', 'project'] },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  link: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
