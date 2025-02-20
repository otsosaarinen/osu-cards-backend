"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
// Database path (same as in your main script)
const dbPath = path_1.default.resolve(__dirname, "../db/player_database.db");
// Create a new SQLite database connection
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
    }
    else {
        console.log(`Connected to the database at ${dbPath}`);
    }
});
// Select all rows from osu_players table
db.all("SELECT * FROM osu_players", (err, rows) => {
    if (err) {
        console.error("Error querying the database:", err);
    }
    else {
        console.log("All players in database:");
        console.table(rows); // Display the rows in a table format
    }
    // Close the database after query
    db.close((closeErr) => {
        if (closeErr) {
            console.error("Error closing the database:", closeErr.message);
        }
        else {
            console.log("Database connection closed.");
        }
    });
});
