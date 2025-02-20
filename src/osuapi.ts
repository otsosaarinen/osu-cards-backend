require("dotenv").config();

const API_KEY = process.env.OSU_API_KEY;

async function apiCall(username: string) {
    const url = new URL("https://osu.ppy.sh/api/get_user");

    const params = { k: API_KEY, u: username, type: "string" };
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
        console.log(data);
    } catch (error) {
        console.error("Error fetching osu! user data:", error);
    }
}

apiCall("12311");
