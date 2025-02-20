const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database path (same as in your main script)
const dbPath = path.resolve(__dirname, "../db/player_database.db");

// Connect to the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
    } else {
        console.log(`Connected to the database at ${dbPath}`);
    }
});

// Select all rows from osu_players table
db.all("SELECT * FROM osu_players", (err, rows) => {
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
