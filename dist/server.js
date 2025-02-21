"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = process.env.PORT;
app.use((0, cors_1.default)());
app.get("/api/card_request", (req, res) => {
    let player_data = {};
    const dbPath = path_1.default.resolve(__dirname, "../db/player_database.db");
    const db = new sqlite3_1.default.Database(dbPath, (err) => {
        if (err) {
            console.error("Failed to connect to the database:", err.message);
            res.status(500).json({ message: "Database connection failed" });
            return;
        }
        else {
            console.log(`Connected to the database at ${dbPath}`);
        }
    });
    db.all("SELECT ID, user_id, username, rank, pp, accuracy, country FROM osu_players", (err, rows) => {
        if (err) {
            console.error("Error querying the database:", err);
            res.status(500).json({
                message: "Error querying the database",
            });
            return;
        }
        if (rows.length > 0) {
            const shuffledPlayers = rows.sort(() => 0.5 - Math.random());
            player_data.players = shuffledPlayers.slice(0, 3);
        }
        else {
            player_data.message = "No players found.";
        }
        res.json(player_data);
        db.close((closeErr) => {
            if (closeErr) {
                console.error("Error closing the database:", closeErr.message);
            }
            else {
                console.log("Database connection closed.");
            }
        });
    });
});
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
