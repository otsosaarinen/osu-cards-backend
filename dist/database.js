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
const osuapi_1 = require("./osuapi");
const dbPath = path_1.default.resolve(__dirname, "../db", "player_database.db");
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
    }
    else {
        console.log(`Connected to the database at ${dbPath}`);
    }
});
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
const insertPlayerIfNotExists = (player) => {
    return new Promise((resolve) => {
        db.get("SELECT user_id FROM osu_players WHERE user_id = ?", [player.user_id], (err, row) => {
            if (err) {
                console.error("Error checking existing player:", err);
                resolve();
                return;
            }
            if (row) {
                console.log(`Player with user_id ${player.user_id} already exists. Skipping insertion.`);
                resolve();
            }
            else {
                db.run("INSERT INTO osu_players (user_id, username, rank, pp, accuracy, country) VALUES (?, ?, ?, ?, ?, ?)", [
                    player.user_id,
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
                        console.log(`Inserted player ${player.username} (user_id: ${player.user_id})`);
                    }
                    resolve();
                });
            }
        });
    });
};
const fetchAndInsertPlayers = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Fetching player data from osu! API...");
    const players = yield (0, osuapi_1.apiCall)(osuapi_1.player_list);
    for (const player of players) {
        const osuPlayer = {
            user_id: player.user_id,
            username: player.username,
            rank: player.pp_rank,
            pp: player.pp_raw,
            accuracy: player.accuracy,
            country: player.country,
        };
        yield insertPlayerIfNotExists(osuPlayer);
    }
    db.all("SELECT ID, user_id, username, rank, pp, accuracy, country FROM osu_players", (err, rows) => {
        if (err) {
            console.error("Error querying the database:", err);
        }
        else {
            rows.forEach((row) => {
                console.log(`${row.username} (osu! ID: ${row.user_id}, Rank: ${row.rank}, PP: ${row.pp}, Accuracy: ${row.accuracy}%, Country: ${row.country})`);
            });
        }
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
fetchAndInsertPlayers();
