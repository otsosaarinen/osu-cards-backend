"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path")); // To handle file paths
// Construct the path to the database inside the 'db' folder
const dbPath = path_1.default.resolve(__dirname, "../db", "player_database.db");
// Create or open a SQLite database file (this will persist after program ends)
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
    }
    else {
        console.log(`Connected to the database at ${dbPath}`);
    }
});
// Create the osu_players table with osu_id as a new column
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS osu_players (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            osu_id INTEGER NOT NULL UNIQUE, -- The actual osu! player ID
            username TEXT NOT NULL,
            rank INTEGER,
            pp REAL,
            accuracy REAL,
            country TEXT
        )
    `);
});
// List of players to insert
const players = [
    {
        osu_id: 123456,
        username: "player1",
        rank: 1,
        pp: 10000,
        accuracy: 98.52,
        country: "USA",
    },
    {
        osu_id: 654321,
        username: "player2",
        rank: 50,
        pp: 12900,
        accuracy: 97.46,
        country: "Canada",
    },
    {
        osu_id: 789012,
        username: "player3",
        rank: 100,
        pp: 18500,
        accuracy: 96.81,
        country: "UK",
    },
];
// Function to insert a player after checking if they already exist
const insertPlayerIfNotExists = (player) => {
    db.get("SELECT osu_id FROM osu_players WHERE osu_id = ?", [player.osu_id], (err, row) => {
        if (err) {
            console.error("Error checking existing player:", err);
            return;
        }
        if (row) {
            console.log(`Player with osu_id ${player.osu_id} already exists. Skipping insertion.`);
        }
        else {
            // Player does not exist, insert into the database
            db.run("INSERT INTO osu_players (osu_id, username, rank, pp, accuracy, country) VALUES (?, ?, ?, ?, ?, ?)", [
                player.osu_id,
                player.username,
                player.rank,
                player.pp,
                player.accuracy,
                player.country,
            ], (insertErr) => {
                if (insertErr) {
                    console.error("Error inserting player:", insertErr);
                }
                else {
                    console.log(`Inserted player ${player.username} (osu_id: ${player.osu_id})`);
                }
            });
        }
    });
};
// Insert all players while ensuring no duplicates
players.forEach(insertPlayerIfNotExists);
// Query the players and log the results
db.all("SELECT ID, osu_id, username, rank, pp, accuracy, country FROM osu_players", (err, rows) => {
    if (err) {
        console.error("Error querying the database:", err);
    }
    else {
        rows.forEach((row) => {
            console.log(`${row.username} (osu! ID: ${row.osu_id}, Rank: ${row.rank}, PP: ${row.pp}, Accuracy: ${row.accuracy}%, Country: ${row.country})`);
        });
    }
});
// Close the database connection when done
db.close((err) => {
    if (err) {
        console.error("Error closing the database:", err.message);
    }
    else {
        console.log("Database connection closed.");
    }
});
