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
Object.defineProperty(exports, "__esModule", { value: true });
exports.player_list = void 0;
exports.apiCall = apiCall;
require("dotenv").config();
const API_KEY = process.env.OSU_API_KEY;
let player_list = [
    "milosz",
    "jahkon",
    "cloutiful",
    "plasma",
    "asecretbox",
    "minhoca loka",
    "flyingtuna",
    "yellow sucks",
    "aknzx",
    "freezes",
];
exports.player_list = player_list;
function apiCall(players) {
    return __awaiter(this, void 0, void 0, function* () {
        let fetched = [];
        const fetchPromises = players.map((player) => __awaiter(this, void 0, void 0, function* () {
            const url = new URL("https://osu.ppy.sh/api/get_user");
            const params = { k: API_KEY, u: player, type: "string" };
            Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));
            try {
                const response = yield fetch(url.toString(), {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = yield response.json();
                if (data.length > 0) {
                    fetched.push({
                        user_id: data[0].user_id,
                        username: data[0].username,
                        pp_rank: data[0].pp_rank,
                        pp_raw: data[0].pp_raw,
                        accuracy: data[0].accuracy,
                        country: data[0].country,
                    });
                }
            }
            catch (error) {
                console.error(`Error fetching data for ${player}:`, error);
            }
        }));
        yield Promise.all(fetchPromises);
        return fetched;
    });
}
