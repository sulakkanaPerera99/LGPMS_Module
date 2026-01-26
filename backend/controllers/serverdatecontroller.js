import { getServerDate, saveServerDate } from "../models/ServerDate.js";

// Fetch current server date
export const showServerDate = (req, res) => {
    res.json({ serverDate: getServerDate() });
};

// Save server date to the database
export const storeServerDate = (req, res) => {
    saveServerDate((err, result) => {
        if (err) {
            res.status(500).json({ error: "Failed to save server date" });
        } else {
            res.status(201).json({ message: "Server date saved successfully" });
        }
    });
};
