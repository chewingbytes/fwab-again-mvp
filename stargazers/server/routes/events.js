import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { verifyToken, requireRole, optionalAuth } from "../authmiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const eventsFilePath = path.join(__dirname, "../../../stargazing.events.json");

function readEvents() {
  try {
    const data = fs.readFileSync(eventsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading events file:", error);
    return [];
  }
}

function writeEvents(events) {
  try {
    fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing events file:", error);
    return false;
  }
}

router.get("/", optionalAuth, (req, res) => {
  try {
    const events = readEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/:id", optionalAuth, (req, res) => {
  try {
    const events = readEvents();
    const event = events.find((e) => e.id === parseInt(req.params.id));
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

router.get("/name/:eventName", optionalAuth, (req, res) => {
  try {
    const events = readEvents();
    const event = events.find((e) => e.eventName === req.params.eventName);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

router.post("/", verifyToken, requireRole("admin"), (req, res) => {
  try {
    const {
      eventName,
      eventDate,
      startTime,
      endTime,
      location,
      description,
      participantsLimit,
    } = req.body;

    if (
      !eventName ||
      !eventDate ||
      !startTime ||
      !endTime ||
      !location ||
      !description ||
      !participantsLimit
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const events = readEvents();

    const existingEvent = events.find((e) => e.eventName === eventName);
    if (existingEvent) {
      return res
        .status(400)
        .json({ error: "Event with this name already exists" });
    }

    const newId =
      events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;

    const newEvent = {
      _id: {
        $oid: Math.random().toString(36).substring(2) + Date.now().toString(36),
      },
      id: newId,
      eventName,
      eventDate,
      startTime,
      endTime,
      location,
      description,
      participantsLimit: parseInt(participantsLimit),
    };

    events.push(newEvent);

    if (writeEvents(events)) {
      res.status(201).json(newEvent);
    } else {
      res.status(500).json({ error: "Failed to save event" });
    }
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

router.put("/:eventName", verifyToken, requireRole("admin"), (req, res) => {
  try {
    const { eventName: oldEventName } = req.params;
    const {
      eventName,
      eventDate,
      startTime,
      endTime,
      location,
      description,
      participantsLimit,
    } = req.body;

    const events = readEvents();
    const eventIndex = events.findIndex((e) => e.eventName === oldEventName);

    if (eventIndex === -1) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if new event name is taken by another event
    if (eventName && eventName !== oldEventName) {
      const nameTaken = events.find((e) => e.eventName === eventName);
      if (nameTaken) {
        return res.status(400).json({ error: "Event name already exists" });
      }
    }

    if (eventName) events[eventIndex].eventName = eventName;
    if (eventDate) events[eventIndex].eventDate = eventDate;
    if (startTime) events[eventIndex].startTime = startTime;
    if (endTime) events[eventIndex].endTime = endTime;
    if (location) events[eventIndex].location = location;
    if (description) events[eventIndex].description = description;
    if (participantsLimit)
      events[eventIndex].participantsLimit = parseInt(participantsLimit);

    if (writeEvents(events)) {
      res.json(events[eventIndex]);
    } else {
      res.status(500).json({ error: "Failed to update event" });
    }
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

router.delete("/:eventName", verifyToken, requireRole("admin"), (req, res) => {
  try {
    const { eventName } = req.params;
    const events = readEvents();
    const eventIndex = events.findIndex((e) => e.eventName === eventName);

    if (eventIndex === -1) {
      return res.status(404).json({ error: "Event not found" });
    }

    const deletedEvent = events[eventIndex];
    events.splice(eventIndex, 1);

    if (writeEvents(events)) {
      res.json({ message: "Event deleted successfully", event: deletedEvent });
    } else {
      res.status(500).json({ error: "Failed to delete event" });
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

router.get("/", (req, res) => {
  try {
    const events = readEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get("/:id", (req, res) => {
  try {
    const events = readEvents();
    const event = events.find((e) => e.id === parseInt(req.params.id));
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

router.get("/name/:eventName", (req, res) => {
  try {
    const events = readEvents();
    const event = events.find((e) => e.eventName === req.params.eventName);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

router.post("/", (req, res) => {
  try {
    const {
      eventName,
      eventDate,
      startTime,
      endTime,
      location,
      description,
      participantsLimit,
    } = req.body;

    if (
      !eventName ||
      !eventDate ||
      !startTime ||
      !endTime ||
      !location ||
      !description ||
      !participantsLimit
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const events = readEvents();

    const existingEvent = events.find((e) => e.eventName === eventName);
    if (existingEvent) {
      return res
        .status(400)
        .json({ error: "Event with this name already exists" });
    }

    const newId =
      events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;

    const newEvent = {
      _id: {
        $oid: Math.random().toString(36).substring(2) + Date.now().toString(36),
      },
      id: newId,
      eventName,
      eventDate,
      startTime,
      endTime,
      location,
      description,
      participantsLimit: parseInt(participantsLimit),
    };

    events.push(newEvent);

    if (writeEvents(events)) {
      res.status(201).json(newEvent);
    } else {
      res.status(500).json({ error: "Failed to save event" });
    }
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event" });
  }
});

router.put("/:eventName", (req, res) => {
  try {
    const { eventName: oldEventName } = req.params;
    const {
      eventName,
      eventDate,
      startTime,
      endTime,
      location,
      description,
      participantsLimit,
    } = req.body;

    const events = readEvents();
    const eventIndex = events.findIndex((e) => e.eventName === oldEventName);

    if (eventIndex === -1) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (eventName && eventName !== oldEventName) {
      const nameTaken = events.find((e) => e.eventName === eventName);
      if (nameTaken) {
        return res.status(400).json({ error: "Event name already exists" });
      }
    }

    if (eventName) events[eventIndex].eventName = eventName;
    if (eventDate) events[eventIndex].eventDate = eventDate;
    if (startTime) events[eventIndex].startTime = startTime;
    if (endTime) events[eventIndex].endTime = endTime;
    if (location) events[eventIndex].location = location;
    if (description) events[eventIndex].description = description;
    if (participantsLimit)
      events[eventIndex].participantsLimit = parseInt(participantsLimit);

    if (writeEvents(events)) {
      res.json(events[eventIndex]);
    } else {
      res.status(500).json({ error: "Failed to update event" });
    }
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

router.delete("/:eventName", (req, res) => {
  try {
    const { eventName } = req.params;
    const events = readEvents();
    const eventIndex = events.findIndex((e) => e.eventName === eventName);

    if (eventIndex === -1) {
      return res.status(404).json({ error: "Event not found" });
    }

    const deletedEvent = events[eventIndex];
    events.splice(eventIndex, 1);

    if (writeEvents(events)) {
      res.json({ message: "Event deleted successfully", event: deletedEvent });
    } else {
      res.status(500).json({ error: "Failed to delete event" });
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
