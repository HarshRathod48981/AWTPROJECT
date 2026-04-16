const express = require('express');
const multer = require('multer');
const path = require('path');
const { createItem, getItemsByBoard, updateItem, deleteItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image uploads are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post('/', protect, upload.single('image'), createItem);
router.get('/:boardId', protect, getItemsByBoard);
router.put('/:itemId', protect, upload.single('image'), updateItem);
router.delete('/:itemId', protect, deleteItem);

module.exports = router;
