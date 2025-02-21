require("dotenv").config();
import express, { Request, Response } from "express";
import cors from "cors";
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

// use CORS middleware
app.use(cors());

app.get("/api/card_request", (req: Request, res: Response) => {
    let player_data: { players?: OsuPlayer[]; message?: string } = {};

    // Database path (same as in your main script)
    const dbPath: string = path.resolve(__dirname, "../db/player_database.db");

    // Create a new SQLite database connection
    const db = new sqlite3.Database(dbPath, (err: Error | null) => {
        if (err) {
            console.error("Failed to connect to the database:", err.message);
            res.status(500).json({ message: "Database connection failed" }); // Return error in JSON
            return;
        } else {
            console.log(`Connected to the database at ${dbPath}`);
        }
    });

    // Query the database
    db.all(
        "SELECT ID, user_id, username, rank, pp, accuracy, country FROM osu_players",
        (err, rows: OsuPlayer[]) => {
            if (err) {
                console.error("Error querying the database:", err);
                res.status(500).json({
                    message: "Error querying the database",
                }); // Return error in JSON
                return;
            }

            if (rows.length > 0) {
                player_data.players = rows;
            } else {
                player_data.message = "No players found.";
            }

            // Send the response in JSON format
            res.json(player_data);

            // Close the database connection
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

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
