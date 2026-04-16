const Board = require('../models/Board');
const Item = require('../models/Item');

// @desc    Create board
// @route   POST /api/boards
// @access  Private
const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const board = await Board.create({
      title,
      description: description || '',
      userId: req.user._id,
    });

    return res.status(201).json(board);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    List boards
// @route   GET /api/boards
// @access  Private
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(boards);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Browse public boards from all users
// @route   GET /api/boards/public
// @access  Public
const getPublicBoards = async (req, res) => {
  try {
    const boards = await Board.find({})
      .populate('userId', 'username bio avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json(boards);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get board by id
// @route   GET /api/boards/:boardId
// @access  Private
const getBoardById = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.boardId, userId: req.user._id });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    return res.status(200).json(board);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete board and its items
// @route   DELETE /api/boards/:boardId
// @access  Private
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.boardId, userId: req.user._id });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    await Item.deleteMany({ boardId: board._id, userId: req.user._id });
    await board.deleteOne();

    return res.status(200).json({ message: 'Board deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createBoard, getBoards, getPublicBoards, getBoardById, deleteBoard };
