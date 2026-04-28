import admin from "../config/firebase-config.js";

export const verifyToken = async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized: No token provided" });
	}


	const token = authHeader.split(" ")[1];

	try {
		const decodedToken = await admin.auth().verifyIdToken(token);


		req.user = decodedToken;
		return next();
	} catch (error) {
		console.error("Firebase Auth Error:", error.message);
		res.status(403).json({
			error: "Invalid or expired token",
		});
	}
};
