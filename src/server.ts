require("dotenv").config();
import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import path from "path";

const app = express();
const port = process.env.PORT;

interface OsuPlayer {
    user_id: string;
    username: string;
    rank: string;
    pp: string;
    accuracy: string;
    country: string;
}

interface PlayerData {
    players?: OsuPlayer[]; // Optional players array
    message?: string; // Optional message in case no players are found
}

app.get("/api/card_request", (req: Request, res: Response) => {
    // Initialize an empty object with PlayerData type
    let player_data: PlayerData = {};

    // Database path (same as in your main script)
    const dbPath: string = path.resolve(__dirname, "../db/player_database.db");

    // Create a new SQLite database connection
    const db = new sqlite3.Database(dbPath, (err: Error | null) => {
        if (err) {
            console.error("Failed to connect to the database:", err.message);
            res.status(500).send("Failed to connect to the database.");
            return; // Exit early if DB connection fails
        } else {
            console.log(`Connected to the database at ${dbPath}`);
        }
    });

    // Query the database for player data
    db.all(
        "SELECT ID, user_id, username, rank, pp, accuracy, country FROM osu_players",
        (err, rows: OsuPlayer[]) => {
            if (err) {
                console.error("Error querying the database:", err);
                res.status(500).send("Error querying the database.");
                return; // Exit early if there's a query error
            }

            // If there are rows, populate player_data
            if (rows.length > 0) {
                player_data.players = rows; // Storing the array of player objects
            } else {
                player_data.message = "No players found."; // Handle case if no players exist
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

                // Send the response after database operations are complete
                res.json(player_data); // Send the player data in JSON format
            });
        }
    );
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
