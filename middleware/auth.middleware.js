const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {

  /* GOOGLE LOGIN */
  if (req.isAuthenticated && req.isAuthenticated()) {
    req.user = { id: req.user._id };
    return next();
  }

  /* JWT LOGIN */
  // Look for the token in the custom header or the standard Authorization header
  let token = req.header("x-auth-token");

  if (!token && req.header("Authorization")) {
    const authHeader = req.header("Authorization");
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]; // Extract token text cleanly
    }
  }

  if (!token) {
    return res.status(401).json({ msg: "Not authenticated" });
  }

  try {
    // 💡 FIX: Use the exact same secret used during login signing.
    // Fallback to "mysecretkey" if process.env.JWT_SECRET is missing.
    const secret = process.env.JWT_SECRET || "mysecretkey";
    
    const decoded = jwt.verify(token, secret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token invalid" });
  }
};
