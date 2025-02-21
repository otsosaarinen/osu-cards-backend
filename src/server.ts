require("dotenv").config();
import express, { Request, Response } from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import path from "path";

const app = express();
const port = process.env.PORT; // Get the port from environment variables

// Define the structure of an OsuPlayer object
interface OsuPlayer {
    user_id: string;
    username: string;
    rank: string;
    pp: string;
    accuracy: string;
    country: string;
}

// Define the expected response structure
interface PlayerData {
    players?: OsuPlayer[]; // Optional array of players
    message?: string; // Optional message in case no players are found
}

// Enable CORS to allow cross-origin requests
app.use(cors());

// Define the API endpoint to fetch player data
app.get("/api/card_request", (req: Request, res: Response) => {
    let player_data: PlayerData = {};

    // Define the path to the SQLite database file
    const dbPath: string = path.resolve(__dirname, "../db/player_database.db");

    // Create a new SQLite database connection
    const db = new sqlite3.Database(dbPath, (err: Error | null) => {
        if (err) {
            console.error("Failed to connect to the database:", err.message);
            res.status(500).json({ message: "Database connection failed" }); // Return an error response
            return;
        } else {
            console.log(`Connected to the database at ${dbPath}`);
        }
    });

    // Query the database to get player data
    db.all(
        "SELECT ID, user_id, username, rank, pp, accuracy, country FROM osu_players",
        (err, rows: OsuPlayer[]) => {
            if (err) {
                console.error("Error querying the database:", err);
                res.status(500).json({
                    message: "Error querying the database",
                }); // Return an error response
                return;
            }

            // Check if any data was retrieved
            if (rows.length > 0) {
                // Shuffle the players array randomly
                const shuffledPlayers = rows.sort(() => 0.5 - Math.random());

                // Take the first 3 players from the shuffled array
                player_data.players = shuffledPlayers.slice(0, 3);
            } else {
                player_data.message = "No players found."; // No data found message
            }

            // Send the response in JSON format
            res.json(player_data);

            // Close the database connection after the response is sent
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
});

// Start the Express server and listen on the specified port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
