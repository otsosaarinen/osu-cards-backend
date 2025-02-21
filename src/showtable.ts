import sqlite3 from "sqlite3";
import path from "path";

// Define the structure of a player row in the database
interface OsuPlayer {
    ID: number; // Primary key, auto-incremented
    osu_id: number; // osu! player ID
    username: string;
    rank: number;
    pp: number;
    accuracy: number;
    country: string;
}

// Database path (same as in your main script)
const dbPath: string = path.resolve(__dirname, "../db/player_database.db");

// Create a new SQLite database connection
const db = new sqlite3.Database(dbPath, (err: Error | null) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
    } else {
        console.log(`Connected to the database at ${dbPath}`);
    }
});

// Select all rows from osu_players table
db.all<OsuPlayer[]>("SELECT * FROM osu_players ORDER BY rank", (err, rows) => {
    if (err) {
        console.error("Error querying the database:", err);
    } else {
        console.log("All players in database:");
        console.table(rows); // Display the rows in a table format
    }

    // Close the database after query
    db.close((closeErr) => {
        if (closeErr) {
            console.error("Error closing the database:", closeErr.message);
        } else {
            console.log("Database connection closed.");
        }
    });
});
