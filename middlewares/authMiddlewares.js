const jwt = require("jsonwebtoken");

//-----protected route ko create karna ha
//“We use middleware for protected routes to verify JWT tokens before accessing controllers,
//  ensuring reusability, security, and clean separation of concerns.”

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {

    try {
      token = req.headers.authorization.split(" ")[1];
    
      const decoded = jwt.verify( token ,process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Token invalid" });
    }
  }
  if (!token) {
    return res.status(401).json({ message: "No token, access denied" });
  }
};

module.exports = protect;
