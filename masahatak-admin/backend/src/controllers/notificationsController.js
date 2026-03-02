const { db } = require('../config/firebase');

// Get notifications for admin
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const snapshot = await db.collection('notifications')
      .where('recipientType', '==', 'admin')
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(offset)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalSnapshot = await db.collection('notifications')
      .where('recipientType', '==', 'admin')
      .get();

    const total = totalSnapshot.size;

    res.json({
      success: true,
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark notification as read
exports.readNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await db.collection('notifications').doc(notificationId).update({
      isRead: true,
      readAt: new Date()
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Read notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Send notification to users
exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    const notificationRef = await db.collection('notifications').add({
      userId,
      recipientType: 'user',
      title,
      message,
      type: type || 'general',
      isRead: false,
      createdAt: new Date()
    });

    res.json({
      success: true,
      notificationId: notificationRef.id,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// List all notifications (admin view of all system notifications)
exports.listAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, recipientType, isRead } = req.query;
    const offset = (page - 1) * limit;

    let query = db.collection('notifications');

    if (recipientType) {
      query = query.where('recipientType', '==', recipientType);
    }

    if (isRead !== undefined) {
      query = query.where('isRead', '==', isRead === 'true');
    }

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(offset)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    res.json({
      success: true,
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List all notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await db.collection('notifications').doc(notificationId).delete();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
