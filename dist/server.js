"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
// Database path
const dbPath = path_1.default.resolve(__dirname, "../db", "player_database.db");
// Create or open the database
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
    }
    else {
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
// Function to insert a player only if they don't exist
const insertPlayerIfNotExists = (player) => {
    return new Promise((resolve) => {
        db.get("SELECT osu_id FROM osu_players WHERE osu_id = ?", [player.osu_id], (err, row) => {
            if (err) {
                console.error("Error checking existing player:", err);
                resolve();
                return;
            }
            if (row) {
                console.log(`Player with osu_id ${player.osu_id} already exists. Skipping insertion.`);
                resolve();
            }
            else {
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
                    resolve();
                });
            }
        });
    });
};
// Insert all players sequentially, then fetch and print them
const insertPlayersAndPrint = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const player of players) {
        yield insertPlayerIfNotExists(player);
    }
    // Now print the players after all inserts are complete
    db.all("SELECT ID, osu_id, username, rank, pp, accuracy, country FROM osu_players", (err, rows) => {
        if (err) {
            console.error("Error querying the database:", err);
        }
        else {
            rows.forEach((row) => {
                console.log(`${row.username} (osu! ID: ${row.osu_id}, Rank: ${row.rank}, PP: ${row.pp}, Accuracy: ${row.accuracy}%, Country: ${row.country})`);
            });
        }
        // Close the database after everything is done
        db.close((closeErr) => {
            if (closeErr) {
                console.error("Error closing the database:", closeErr.message);
            }
            else {
                console.log("Database connection closed.");
            }
        });
    });
});
// Run the function to insert players and print them
insertPlayersAndPrint();
