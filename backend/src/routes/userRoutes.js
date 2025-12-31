import express from 'express';
import {
  getAllUsers,
  getUsersByRole,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateOnlineStatus
} from '../controllers/userController.js';
import { authenticateUser, requireHOD, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Get all users (HOD and Professor can view all)
router.get('/', getAllUsers);

// Get users by role
router.get('/role/:role', getUsersByRole);

// Get single user
router.get('/:id', getUserById);

// Create user (HOD and Professor can create)
router.post('/', requireAdmin, createUser);

// Update user (HOD only for role changes, users can update their own profile)
router.put('/:id', updateUser);

// Delete user (HOD only)
router.delete('/:id', requireHOD, deleteUser);

// Update online status
router.patch('/status/online', updateOnlineStatus);

export default router;
