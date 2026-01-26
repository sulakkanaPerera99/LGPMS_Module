import express from "express";
import { loginUser  } from "../controllers/employee.js";
// import { verifyToken } from "../middleware/verifyToken.js";

const logingrouter = express.Router();

// Login route (POST, send NIC + password in body)
logingrouter.post("/api/login", loginUser);
// logingrouter.get("/api/protected", protectedData);

// Example protected route
// logingrouter.get("/api/protected", verifyToken, (req, res) => {
//   res.json({ message: "Protected data OK", user: req.user });
// });

export default logingrouter;
