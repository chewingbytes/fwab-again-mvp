// Utility functions for local JSON data modification only
import fs from "fs";
import path from "path";

const usersFile = path.resolve("../../stargazing.users.json");
const eventsFile = path.resolve("../../stargazing.events.json");

export function readUsers() {
  return JSON.parse(fs.readFileSync(usersFile, "utf-8"));
}

export function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

export function readEvents() {
  return JSON.parse(fs.readFileSync(eventsFile, "utf-8"));
}

export function writeEvents(events) {
  fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2));
}
