require("dotenv").config();

import sqlite3 from "sqlite3";
import path from "path";

// Define the structure of a row in the osu_players table
interface OsuPlayer {
    osu_id: number;
    username: string;
    rank: number;
    pp: number;
    accuracy: number;
    country: string;
}

// Database path
const dbPath = path.resolve(__dirname, "../db", "player_database.db");

// Create or open the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
    } else {
        console.log(`Connected to the database at ${dbPath}`);
    }
});

// Ensure the table exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS osu_players (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            osu_id INTEGER NOT NULL UNIQUE,
            username TEXT NOT NULL,
            rank INTEGER,
            pp REAL,
            accuracy REAL,
            country TEXT
        )
    `);
});

// List of players to insert
const players: OsuPlayer[] = [
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

// Function to insert a player only if they don't exist
const insertPlayerIfNotExists = (player: OsuPlayer): Promise<void> => {
    return new Promise((resolve) => {
        db.get(
            "SELECT osu_id FROM osu_players WHERE osu_id = ?",
            [player.osu_id],
            (err, row) => {
                if (err) {
                    console.error("Error checking existing player:", err);
                    resolve();
                    return;
                }

                if (row) {
                    console.log(
                        `Player with osu_id ${player.osu_id} already exists. Skipping insertion.`
                    );
                    resolve();
                } else {
                    db.run(
                        "INSERT INTO osu_players (osu_id, username, rank, pp, accuracy, country) VALUES (?, ?, ?, ?, ?, ?)",
                        [
                            player.osu_id,
                            player.username,
                            player.rank,
                            player.pp,
                            player.accuracy,
                            player.country,
                        ],
                        (insertErr) => {
                            if (insertErr) {
                                console.error(
                                    "Error inserting player:",
                                    insertErr
                                );
                            } else {
                                console.log(
                                    `Inserted player ${player.username} (osu_id: ${player.osu_id})`
                                );
                            }
                            resolve();
                        }
                    );
                }
            }
        );
    });
};

// Insert all players sequentially, then fetch and print them
const insertPlayersAndPrint = async () => {
    for (const player of players) {
        await insertPlayerIfNotExists(player);
    }

    // Now print the players after all inserts are complete
    db.all(
        "SELECT ID, osu_id, username, rank, pp, accuracy, country FROM osu_players",
        (err, rows: OsuPlayer[]) => {
            if (err) {
                console.error("Error querying the database:", err);
            } else {
                rows.forEach((row) => {
                    console.log(
                        `${row.username} (osu! ID: ${row.osu_id}, Rank: ${row.rank}, PP: ${row.pp}, Accuracy: ${row.accuracy}%, Country: ${row.country})`
                    );
                });
            }

            // Close the database after everything is done
            db.close((closeErr) => {
                if (closeErr) {
                    console.error(
                        "Error closing the database:",
                        closeErr.message
                    );
                } else {
                    console.log("Database connection closed.");
                }
            });
        }
    );
};

// Run the function to insert players and print them
insertPlayersAndPrint();
