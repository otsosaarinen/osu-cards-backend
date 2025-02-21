require("dotenv").config();

const API_KEY = process.env.OSU_API_KEY;

let player_list = [
    "mrekk",
    "ivaxa",
    "accolibed",
    "gnahus",
    "ninerik",
    "bored yes",
    "jappadekappa",
    "nyanpotato",
    "detective",
    "creator",
];

async function apiCall(players: string[]) {
    let fetched: {
        user_id: string;
        username: string;
        pp_rank: string;
        pp_raw: string;
        accuracy: string;
        country: string;
    }[] = [];

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
                fetched.push({
                    user_id: data[0].user_id,
                    username: data[0].username,
                    pp_rank: data[0].pp_rank,
                    pp_raw: data[0].pp_raw,
                    accuracy: data[0].accuracy,
                    country: data[0].country,
                }); // Push the relevant data for each player
            }
        } catch (error) {
            console.error(`Error fetching data for ${player}:`, error);
        }
    });

    await Promise.all(fetchPromises); // Wait for all requests to complete

    return fetched; // Return the fetched player data as an array
}

export { player_list, apiCall };
