import express from "express";
import { showServerDate, storeServerDate } from "../controllers/serverdatecontroller.js";
import { addonlinelog } from "../controllers/log.js";

const dateroutes = express.Router();

dateroutes.get("/api/getserverdate", showServerDate); // Fetch current server date
dateroutes.post("/api/saveserverdate", storeServerDate); // Save current server date

///////////////////log/////////////
dateroutes.post("/api/onlinelogin", addonlinelog); // Save current login

export default dateroutes;
