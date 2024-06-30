import { config } from "dotenv";

config();

const TTS_HOST_URL = process.env.TTS_HOST_URL;

async function fetchCharacterList() {
  const apiUrl = `${TTS_HOST_URL}/character_list`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching character list:", error);
    return [];
  }
}

export { fetchCharacterList };
