import axios from "axios";

import { config } from "dotenv";

config();
const LAGO_BASE_URL = process.env.LAGO_BASE_URL;

async function postRequest(apiPath, jsonData) {
  try {
    console.log(jsonData);
    const response = await axios.post(LAGO_BASE_URL + apiPath, jsonData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Lago request to ${apiPath} succeeded:`, response);
    return response;
  } catch (error) {
    console.log(`Lago request to ${apiPath} failed:`, error.message);
    throw error;
  }
}

export { postRequest };
