import { hashPassword } from "../apis/utils/utils";

const credentials = [
  {
    username: "your_power_username_1",
    password: hashPassword("your_password_1"),
  },
  {
    username: "your_power_username_2",
    password: hashPassword("your_password_2"),
  },
];

// Save to a JSON file
await Bun.write("credentials.json", JSON.stringify(credentials, null, 2));
