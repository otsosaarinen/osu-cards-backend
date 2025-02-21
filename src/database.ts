require("dotenv").config();

import sqlite3 from "sqlite3";
import path from "path";
import { apiCall, player_list } from "./osuapi"; // Import API functions from osuapi.ts

// Define the structure of a row in the osu_players table
interface OsuPlayer {
    user_id: string; // Unique ID of the player
    username: string; // Player's in-game name
    rank: string; // Player's global rank
    pp: string; // Player's performance points
    accuracy: string; // Player's accuracy percentage
    country: string; // Player's country code
}

// Define the path to the SQLite database file
const dbPath = path.resolve(__dirname, "../db", "player_database.db");

// Create or open the SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
    } else {
        console.log(`Connected to the database at ${dbPath}`);
    }
});

// Ensure the osu_players table exists, create it if not
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

// Function to insert a player into the database **only if they do not exist**
const insertPlayerIfNotExists = (player: OsuPlayer): Promise<void> => {
    return new Promise((resolve) => {
        // Check if the player already exists in the database
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
                    // Insert new player into the database
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

// Function to fetch player data from the osu! API and insert into the database
const fetchAndInsertPlayers = async () => {
    console.log("Fetching player data from osu! API...");

    // Fetch players from the osu! API
    const players = await apiCall(player_list);

    // Iterate through the players and insert them into the database
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

    // Print all players from the database after inserting new ones
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

            // Close the database connection after everything is done
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
