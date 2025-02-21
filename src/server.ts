require("dotenv").config();

import sqlite3 from "sqlite3";
import path from "path";
import { apiCall, player_list } from "./osuapi"; // Import apiCall from osuapi.ts

// Define the structure of a row in the osu_players table
interface OsuPlayer {
    user_id: string;
    username: string;
    rank: string;
    pp: string;
    accuracy: string;
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
            user_id TEXT NOT NULL UNIQUE,
            username TEXT NOT NULL,
            rank TEXT,
            pp TEXT,
            accuracy TEXT,
            country TEXT
        )
    `);
});

// Function to insert a player only if they don't exist
const insertPlayerIfNotExists = (player: OsuPlayer): Promise<void> => {
    return new Promise((resolve) => {
        db.get(
            "SELECT user_id FROM osu_players WHERE user_id = ?",
            [player.user_id],
            (err, row) => {
                if (err) {
                    console.error("Error checking existing player:", err);
                    resolve();
                    return;
                }

                if (row) {
                    console.log(
                        `Player with user_id ${player.user_id} already exists. Skipping insertion.`
                    );
                    resolve();
                } else {
                    db.run(
                        "INSERT INTO osu_players (user_id, username, rank, pp, accuracy, country) VALUES (?, ?, ?, ?, ?, ?)",
                        [
                            player.user_id,
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
                                    `Inserted player ${player.username} (user_id: ${player.user_id})`
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

    //console.log("Fetched data:", players);

    for (const player of players) {
        const osuPlayer = {
            user_id: player.user_id,
            username: player.username,
            rank: player.pp_rank,
            pp: player.pp_raw,
            accuracy: player.accuracy,
            country: player.country,
        };
        await insertPlayerIfNotExists(osuPlayer);
    }

    // Print all players after inserting
    db.all(
        "SELECT ID, user_id, username, rank, pp, accuracy, country FROM osu_players",
        (err, rows: OsuPlayer[]) => {
            if (err) {
                console.error("Error querying the database:", err);
            } else {
                rows.forEach((row) => {
                    console.log(
                        `${row.username} (osu! ID: ${row.user_id}, Rank: ${row.rank}, PP: ${row.pp}, Accuracy: ${row.accuracy}%, Country: ${row.country})`
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
