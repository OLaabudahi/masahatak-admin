const { db } = require('../config/firebase');

// Get all workspaces
exports.getAllWorkspaces = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;

    let query = db.collection('workspaces');

    if (status !== 'all') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    let workspaces = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedWorkspaces = workspaces.slice(startIndex, endIndex);

    res.json({
      success: true,
      workspaces: paginatedWorkspaces,
      pagination: {
        total: workspaces.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(workspaces.length / limit)
      }
    });
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get workspace by ID
exports.getWorkspaceById = async (req, res) => {
  try {
    const { id } = req.params;

    const workspaceDoc = await db.collection('workspaces').doc(id).get();

    if (!workspaceDoc.exists) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Get owner details
    let owner = null;
    if (workspaceDoc.data().ownerId) {
      try {
        const ownerDoc = await db.collection('providers').doc(workspaceDoc.data().ownerId).get();
        if (ownerDoc.exists) {
          owner = {
            id: ownerDoc.id,
            businessName: ownerDoc.data().businessName,
            email: ownerDoc.data().email
          };
        }
      } catch (ownerError) {
        console.log('Could not fetch owner:', ownerError.message);
      }
    }

    // Get recent bookings (without orderBy to avoid index requirement)
    let bookings = [];
    try {
      const bookingsSnapshot = await db.collection('bookings')
        .where('workspaceId', '==', id)
        .limit(10)
        .get();

      bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort in memory by createdAt
      bookings.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
    } catch (bookingError) {
      console.log('Could not fetch bookings:', bookingError.message);
      bookings = [];
    }

    res.json({
      success: true,
      workspace: {
        id: workspaceDoc.id,
        ...workspaceDoc.data(),
        owner
      },
      recentBookings: bookings
    });
  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Approve/reject workspace
exports.updateWorkspaceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const updateData = {
      status,
      updatedAt: new Date(),
      reviewedBy: req.admin.id
    };

    // Store reason for rejection or other status changes
    if (rejectionReason) {
      updateData.statusReason = rejectionReason;
      // Keep rejectionReason for backwards compatibility
      updateData.rejectionReason = rejectionReason;
    }

    await db.collection('workspaces').doc(id).update(updateData);

    res.json({
      success: true,
      message: `Workspace ${status} successfully`
    });
  } catch (error) {
    console.error('Update workspace status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete workspace
exports.deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log('Delete workspace request:', { id, reason, adminId: req.admin.id });

    const updateData = {
      status: 'deleted',
      statusReason: reason || '',
      deletedAt: new Date(),
      deletedBy: req.admin.id
    };

    console.log('Updating workspace with:', updateData);

    await db.collection('workspaces').doc(id).update(updateData);

    console.log('Workspace deleted successfully:', id);

    res.json({
      success: true,
      message: 'Workspace deleted successfully'
    });
  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
