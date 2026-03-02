const superAdminAuth = (req, res, next) => {
  try {
    // Check if admin exists (already verified by auth middleware)
    if (!req.admin) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if admin has super_admin role
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({
        error: 'Access denied. Super admin privileges required.'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

module.exports = superAdminAuth;
