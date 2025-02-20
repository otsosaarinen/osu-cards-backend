import sqlite3 from "sqlite3";
import path from "path";

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

// Correct DELETE statement
db.run(
    "DELETE FROM osu_players WHERE rank = 0",
    function (this: sqlite3.RunResult, err: Error | null) {
        if (err) {
            console.error("Error deleting from the database:", err);
        } else {
            console.log(`Deleted ${this.changes} rows from the database.`);
        }

        // Close the database after query
        db.close((closeErr: Error | null) => {
            if (closeErr) {
                console.error("Error closing the database:", closeErr.message);
            } else {
                console.log("Database connection closed.");
            }
        });
    }
);
