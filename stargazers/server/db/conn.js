import { MongoClient } from "mongodb";

const uri = "mongodb+srv://bryanchew:BryanChew123@stargazing-connection.xhtoy.mongodb.net/"
const client = new MongoClient(uri);

let conn;

try {
  console.log("Connecting to Local MongoDB");
  conn = await client.connect();
  console.log("Connected successfully to MongoDB");
} catch (e) {
  console.error("Failed to connect to MongoDB", e);
  process.exit(1); // Exit the process with an error code
}

const db = conn.db("stargazing");

// Optional: Use event listeners to monitor connection status
client.on('serverOpening', () => console.log('MongoDB server connection opened'));
client.on('serverClosed', () => console.log('MongoDB server connection closed'));
client.on('serverDescriptionChanged', (event) =>
  console.log('MongoDB server description changed:', event)
);

export default db;
