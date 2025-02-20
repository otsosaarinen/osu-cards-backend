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
require("dotenv").config();
const API_KEY = process.env.OSU_API_KEY;
function apiCall(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = new URL("https://osu.ppy.sh/api/get_user");
        const params = { k: API_KEY, u: username, type: "string" };
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
            console.log(data);
        }
        catch (error) {
            console.error("Error fetching osu! user data:", error);
        }
    });
}
apiCall("12311");
