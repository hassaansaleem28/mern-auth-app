import jwt from "jsonwebtoken";

async function userAuth(req, res, next) {
  const { token } = req.cookies;
  if (!token)
    return res.json({
      success: false,
      message: "Not Authorized! Login Again.",
    });
  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.body = { userId: tokenDecode.id };
    } else
      return res.json({
        success: false,
        message: "Not Authorized! Login Again.....",
      });
    next();
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
}

export default userAuth;
