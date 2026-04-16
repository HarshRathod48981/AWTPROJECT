const Board = require('../models/Board');
const Item = require('../models/Item');

// @desc    Add item to board
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const { boardId, type, title, content, link } = req.body;

    if (!boardId || !type || !title) {
      return res.status(400).json({ message: 'boardId, type, and title are required' });
    }

    const board = await Board.findOne({ _id: boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const item = await Item.create({
      boardId,
      userId: req.user._id,
      type,
      title,
      content: content || '',
      imageUrl,
      link: link || '',
    });

    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch board items
// @route   GET /api/items/:boardId
// @access  Private
const getItemsByBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const items = await Item.find({ boardId: req.params.boardId, userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update item
// @route   PUT /api/items/:itemId
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { type, title, content, link } = req.body;
    const item = await Item.findOne({ _id: req.params.itemId, userId: req.user._id });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (type) item.type = type;
    if (title) item.title = title;
    if (typeof content === 'string') item.content = content;
    if (typeof link === 'string') item.link = link;
    if (req.file) item.imageUrl = `/uploads/${req.file.filename}`;

    const updated = await item.save();
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:itemId
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.itemId, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.deleteOne();
    return res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createItem, getItemsByBoard, updateItem, deleteItem };
