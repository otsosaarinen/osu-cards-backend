require("dotenv").config();

const API_KEY = process.env.OSU_API_KEY;

let player_list = ["Aetherian", "chu", "Tikkanen", "Haadez", "boleks"];

let fetched: string[] = [];

async function apiCall(players: string[]) {
    const fetchPromises = players.map(async (player) => {
        const url = new URL("https://osu.ppy.sh/api/get_user");

        const params = { k: API_KEY, u: player, type: "string" };
        Object.keys(params).forEach((key) =>
            url.searchParams.append(key, (params as any)[key])
        );

        try {
            const response = await fetch(url.toString(), {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.length > 0) {
                fetched.push(data[0].username, data[0].pp_rank); // osu! API returns an array
            }
        } catch (error) {
            console.error(`Error fetching data for ${player}:`, error);
        }
    });

    await Promise.all(fetchPromises); // Wait for all requests to complete
}

async function main() {
    await apiCall(player_list);
    console.log(fetched); // Ensures it prints after API calls are done
}

main();
