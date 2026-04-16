const User = require('../models/User');
const Board = require('../models/Board');
const Item = require('../models/Item');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get public profile by username
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const username = (req.params.username || '').trim();
    const user = await User.findOne({
      username: { $regex: `^${escapeRegex(username)}$`, $options: 'i' },
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const boards = await Board.find({ userId: user._id }).sort({ createdAt: -1 });
    const boardIds = boards.map((board) => board._id);

    const itemCounts = await Item.aggregate([
      { $match: { boardId: { $in: boardIds } } },
      { $group: { _id: '$boardId', count: { $sum: 1 } } },
    ]);

    const itemsByBoard = itemCounts.reduce((accumulator, entry) => {
      accumulator[entry._id.toString()] = entry.count;
      return accumulator;
    }, {});

    const imageItems = await Item.find({
      boardId: { $in: boardIds },
      type: 'image',
      $or: [
        { imageUrl: { $ne: '' } },
        { link: { $ne: '' } },
      ],
    })
      .select('boardId imageUrl link createdAt')
      .sort({ createdAt: -1 });

    const previewsByBoard = imageItems.reduce((accumulator, item) => {
      const boardKey = item.boardId.toString();
      if (!accumulator[boardKey]) {
        accumulator[boardKey] = [];
      }

      if (accumulator[boardKey].length < 4) {
        accumulator[boardKey].push(item.imageUrl || item.link);
      }

      return accumulator;
    }, {});

    const normalizedBoards = boards.map((board) => {
      const itemsCount = itemsByBoard[board._id.toString()] || 0;
      return {
        _id: board._id,
        title: board.title,
        description: board.description,
        userId: board.userId,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        itemsCount,
        previewImages: previewsByBoard[board._id.toString()] || [],
      };
    });

    const itemsCount = normalizedBoards.reduce((total, board) => total + board.itemsCount, 0);

    return res.status(200).json({
      profile: {
        _id: user._id,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
        boardsCount: normalizedBoards.length,
        itemsCount,
      },
      boards: normalizedBoards,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get users for explore discovery
// @route   GET /api/users/discover
// @access  Public
const getDiscoverUsers = async (_req, res) => {
  try {
    const users = await User.find({}).select('username bio avatar createdAt').sort({ createdAt: -1 });
    const userIds = users.map((user) => user._id);
    const boards = await Board.find({ userId: { $in: userIds } }).select('_id userId');
    const boardIds = boards.map((board) => board._id);

    const boardToUser = boards.reduce((accumulator, board) => {
      accumulator[board._id.toString()] = board.userId.toString();
      return accumulator;
    }, {});

    const boardCounts = await Board.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const boardsByUser = boardCounts.reduce((accumulator, entry) => {
      accumulator[entry._id.toString()] = entry.count;
      return accumulator;
    }, {});

    const imageItems = await Item.find({
      boardId: { $in: boardIds },
      type: 'image',
      $or: [
        { imageUrl: { $ne: '' } },
        { link: { $ne: '' } },
      ],
    })
      .select('boardId imageUrl link createdAt')
      .sort({ createdAt: -1 });

    const previewsByUser = imageItems.reduce((accumulator, item) => {
      const boardKey = item.boardId.toString();
      const userKey = boardToUser[boardKey];

      if (!userKey) {
        return accumulator;
      }

      if (!accumulator[userKey]) {
        accumulator[userKey] = [];
      }

      if (accumulator[userKey].length < 4) {
        accumulator[userKey].push(item.imageUrl || item.link);
      }

      return accumulator;
    }, {});

    const discoverUsers = users.map((user) => ({
      id: user._id,
      name: user.username,
      username: user.username,
      bio: user.bio || '',
      avatar: user.avatar || '',
      boardsCount: boardsByUser[user._id.toString()] || 0,
      previewImages: previewsByUser[user._id.toString()] || [],
    }));

    return res.status(200).json(discoverUsers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile, getDiscoverUsers };
