const express = require('express');
const { createBoard, getBoards, getPublicBoards, getBoardById, deleteBoard } = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/public', getPublicBoards);
router.route('/').post(protect, createBoard).get(protect, getBoards);
router.route('/:boardId').get(protect, getBoardById).delete(protect, deleteBoard);

module.exports = router;
