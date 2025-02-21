require("dotenv").config(); // Load environment variables from .env file

// Retrieve the osu! API key from environment variables
const API_KEY = process.env.OSU_API_KEY;

// List of osu! player usernames to fetch data for
let player_list = [
    "yamss",
    "shimon",
    "lexu2s",
    "femboygaming",
    "milkteaism",
    "maliszewski",
    "shyot73",
    "whitecat",
    "jayar",
    "chocopafe",
    "salikuu",
    "kamensh1k",
    "yary",
    "ur cute",
    "awesome sauce",
];

// Function to fetch osu! player data from the osu! API
async function apiCall(players: string[]) {
    // Array to store the fetched player data
    let fetched: {
        user_id: string;
        username: string;
        pp_rank: number;
        pp_raw: number;
        accuracy: number;
        country: string;
    }[] = [];

    // Create an array of API fetch promises
    const fetchPromises = players.map(async (player) => {
        // Construct the API URL
        const url = new URL("https://osu.ppy.sh/api/get_user");

        // Define query parameters (API key, username, and search type)
        const params = { k: API_KEY, u: player, type: "string" };

        // Append query parameters to the URL
        Object.keys(params).forEach((key) =>
            url.searchParams.append(key, (params as any)[key])
        );

        try {
            // Make the API request
            const response = await fetch(url.toString(), {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the JSON response
            const data = await response.json();

            // If player data is found, store the relevant information
            if (data.length > 0) {
                fetched.push({
                    user_id: data[0].user_id, // Unique player ID
                    username: data[0].username, // Player's username
                    pp_rank: parseInt(data[0].pp_rank), // Player's global rank
                    pp_raw: parseFloat(data[0].pp_raw.toFixed(0)), // Round pp_raw to 0 decimals
                    accuracy: parseFloat(data[0].accuracy.toFixed(2)), // Round accuracy to 2 decimals
                    country: data[0].country, // Player's country code
                });
            }
        } catch (error) {
            console.error(`Error fetching data for ${player}:`, error);
        }
    });

    // Wait for all API requests to complete before returning data
    await Promise.all(fetchPromises);

    return fetched; // Return the array of fetched player data
}

// Export the player list and API function for use in other files
export { player_list, apiCall };
