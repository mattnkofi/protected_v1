// backend/src/controller/NotificationController.js
const db = require('../model');
const { Op } = require('sequelize');

const NotificationController = {
  /**
   * Get all notifications for the authenticated user
   * GET /api/v1/notifications
   */
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 50, offset = 0, unread_only = false } = req.query;

      const whereClause = { user_id: userId };
      if (unread_only === 'true') {
        whereClause.is_read = false;
      }

      const notifications = await db.Notification.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Count unread
      const unreadCount = await db.Notification.count({
        where: { user_id: userId, is_read: false }
      });

      res.json({
        success: true,
        notifications: notifications.rows,
        total: notifications.count,
        unreadCount,
        hasMore: notifications.count > parseInt(offset) + parseInt(limit)
      });
    } catch (error) {
      console.error('[NotificationController] getNotifications error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
  },

  /**
   * Get unread notification count
   * GET /api/v1/notifications/unread-count
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await db.Notification.count({
        where: { user_id: userId, is_read: false }
      });

      res.json({ success: true, count });
    } catch (error) {
      console.error('[NotificationController] getUnreadCount error:', error);
      res.status(500).json({ success: false, message: 'Failed to get count' });
    }
  },

  /**
   * Mark a notification as read
   * PATCH /api/v1/notifications/:id/read
   */
  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const notificationId = req.params.id;

      const notification = await db.Notification.findOne({
        where: { id: notificationId, user_id: userId }
      });

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      await notification.update({ is_read: true, read_at: new Date() });

      res.json({ success: true, notification });
    } catch (error) {
      console.error('[NotificationController] markAsRead error:', error);
      res.status(500).json({ success: false, message: 'Failed to mark as read' });
    }
  },

  /**
   * Mark all notifications as read
   * PATCH /api/v1/notifications/read-all
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await db.Notification.update(
        { is_read: true, read_at: new Date() },
        { where: { user_id: userId, is_read: false } }
      );

      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      console.error('[NotificationController] markAllAsRead error:', error);
      res.status(500).json({ success: false, message: 'Failed to mark all as read' });
    }
  },

  /**
   * Delete a notification
   * DELETE /api/v1/notifications/:id
   */
  async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const notificationId = req.params.id;

      const deleted = await db.Notification.destroy({
        where: { id: notificationId, user_id: userId }
      });

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      console.error('[NotificationController] deleteNotification error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
  },

  /**
   * Clear all notifications
   * DELETE /api/v1/notifications/clear-all
   */
  async clearAll(req, res) {
    try {
      const userId = req.user.id;

      await db.Notification.destroy({
        where: { user_id: userId }
      });

      res.json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
      console.error('[NotificationController] clearAll error:', error);
      res.status(500).json({ success: false, message: 'Failed to clear notifications' });
    }
  },

  /**
   * Static helper to create a notification from anywhere in the backend
   * Usage: await NotificationController.create(userId, { type, title, message, ... })
   */
  async create(userId, { type = 'system', title, message, icon = 'bell', action_url = null, metadata = {} }) {
    try {
      const notification = await db.Notification.create({
        user_id: userId,
        type,
        title,
        message,
        icon,
        action_url,
        metadata
      });
      return notification;
    } catch (error) {
      console.error('[NotificationController] create error:', error);
      return null;
    }
  },

  /**
   * Batch create notifications for multiple users
   * Usage: await NotificationController.createBatch([userId1, userId2], { ... })
   */
  async createBatch(userIds, { type = 'system', title, message, icon = 'bell', action_url = null, metadata = {} }) {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type,
        title,
        message,
        icon,
        action_url,
        metadata
      }));

      await db.Notification.bulkCreate(notifications);
      return true;
    } catch (error) {
      console.error('[NotificationController] createBatch error:', error);
      return false;
    }
  }
};

module.exports = NotificationController;
