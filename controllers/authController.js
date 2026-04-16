const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const normalizeEmail = (value = '') => value.trim().toLowerCase();
const normalizeUsername = (value = '') => value.trim();

const safeUserResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  bio: user.bio,
  avatar: user.avatar,
  token: generateToken(user._id),
});

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signupUser = async (req, res) => {
  try {
    const { username, email, password, bio, avatar } = req.body;
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedUsername || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({
      $or: [
        { username: normalizedUsername },
        { email: normalizedEmail },
      ],
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      bio,
      avatar,
    });

    return res.status(201).json(safeUserResponse(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'User already exists' });
    }
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    return res.status(200).json(safeUserResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  return res.status(200).json({
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    bio: req.user.bio,
    avatar: req.user.avatar,
  });
};

module.exports = { signupUser, loginUser, getMe };
