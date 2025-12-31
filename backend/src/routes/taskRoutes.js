import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats
} from '../controllers/taskController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Get task statistics
router.get('/stats', getTaskStats);

// Get all tasks (filtered by role)
router.get('/', getTasks);

// Get single task
router.get('/:id', getTaskById);

// Create task (HOD and Professor only)
router.post('/', requireAdmin, createTask);

// Update task
router.put('/:id', updateTask);

// Delete task
router.delete('/:id', deleteTask);

export default router;
