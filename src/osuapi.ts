require("dotenv").config();

const API_KEY = process.env.OSU_API_KEY;

let player_list = [
    "chu",
    "AllyrD",
    "Dezku",
    "BeerLovingGnome",
    "Haadez",
    "Chakrami",
    "Isak-",
    "Tikkanen",
    "Nev-",
    "Zralf",
];

async function apiCall(players: string[]) {
    let fetched: { username: string; pp_rank: number }[] = [];

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
                    username: data[0].username,
                    pp_rank: data[0].pp_rank,
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
