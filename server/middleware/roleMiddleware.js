exports.authorizeRole = (...roles) => {
  return (req, res, next) => {

    // Check if user exists in request
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // Check if user role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' not permitted`
      });
    }

    next();
  };
};