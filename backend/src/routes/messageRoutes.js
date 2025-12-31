import express from 'express';
import {
  getPrivateMessages,
  sendPrivateMessage,
  markMessageAsRead,
  getUnreadCount,
  getCommunityMessages,
  sendCommunityMessage,
  getConversations
} from '../controllers/messageController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Community chat routes (all users)
router.get('/community', getCommunityMessages);
router.post('/community', sendCommunityMessage);

// Private message routes (HOD and Professors only)
router.get('/private', requireAdmin, getPrivateMessages);
router.post('/private', requireAdmin, sendPrivateMessage);
router.patch('/private/:id/read', requireAdmin, markMessageAsRead);
router.get('/private/unread-count', requireAdmin, getUnreadCount);
router.get('/private/conversations', requireAdmin, getConversations);

export default router;
