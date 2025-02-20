require("dotenv").config();

import sqlite3 from "sqlite3";
import path from "path";
import { apiCall, player_list } from "./osuapi"; // Import apiCall from osuapi.ts

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

// Fetch player data from the API and insert into the database
const fetchAndInsertPlayers = async () => {
    console.log("Fetching player data from osu! API...");

    const players = await apiCall(player_list); // Fetch players from API

    console.log("Fetched data:", players);

    for (const player of players) {
        const osuPlayer = {
            osu_id: player.pp_rank, // Assuming pp_rank is equivalent to osu_id, replace if needed
            username: player.username,
            rank: player.pp_rank, // You can modify this logic depending on the data available
            pp: player.pp_rank, // Replace with actual PP if available
            accuracy: 0, // You might need to include accuracy if available
            country: "Unknown", // You can modify this depending on the data structure
        };
        await insertPlayerIfNotExists(osuPlayer);
    }

    // Print all players after inserting
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

// Run the function to fetch and insert players
fetchAndInsertPlayers();
