import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const authMiddleware = (req, res, next) => {
	const token = req.header("Authorization")?.split(" ")[1]; // Bearer <token>
	if (!token) return res.status(401).json({ message: "Access denied. No token." });

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		res.status(401).json({ message: "Invalid token." });
	}
};

export default authMiddleware;
