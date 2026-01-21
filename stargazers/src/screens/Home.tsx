import getUser from "@/functions/get-user-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Button } from "../components/ui/button";
import { EnvelopeOpenIcon, FilePlusIcon } from "@radix-ui/react-icons";
import { Navbar } from "@/components/navbar";

import { useEffect, useRef, useState } from "react";
import "../App.css";

interface Event {
  _id: string;
  eventName: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  participantsLimit: number;
}

interface User {
  username: string;
}

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const starsRef = useRef<HTMLDivElement>(null);

  async function fetchData() {
    try {
      const response = await fetch("http://localhost:5050/api/events");
      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const eventsData: Event[] = await response.json();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  useEffect(() => {
    fetchData();

    const fetchUserData = async () => {
      const userData = await getUser();
      setUser(userData);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const drawStar = () => {
      const star = document.createElement("div");
      star.className = "star";
      star.style.top = `${Math.random() * 92}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 10}s`;

      starsRef.current!.appendChild(star);
    };

    for (let i = 0; i < 100; i++) {
      drawStar();
    }
  }, []);

  return (
    <>
      <div id="stars" ref={starsRef}></div>
      <div className="h-screen relative flex flex-col items-center justify-center pb-40">
        <h1 className="barrio text-white text-9xl text-center">
          <span className="text-yellow-300">Stargazing</span> @
          <span className="text-red-500"> TP</span>
        </h1>
        {user ? (
          <div className="flex flex-col">
          <h2 className="text-center text-white mt-3 text-xl barrio mb-3">
            Welcome, {user.username}!
          </h2>
          <div className="flex justify-end">
          <Navbar />
          </div>
          </div>
        ) : (
          <div className="flex justify-center mt-6">
            <a href="login">
              <Button className="px-6 py-2 mr-3 rounded">
                <EnvelopeOpenIcon /> Login
              </Button>
            </a>
            <a href="signup">
              <Button className="px-6 py-2 ml-3 rounded">
                <FilePlusIcon /> Sign up to become a member!
              </Button>
            </a>
          </div>
        )}
      </div>

      <div className="bg-black">
        <div className="text-center barrio text-6xl">Upcoming Events</div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event._id}>
              <Card>
                <CardHeader>
                  <CardTitle>{event.eventName}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">
                    <strong>Date:</strong>{" "}
                    {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                  <p className="mb-2">
                    <strong>Time:</strong> {event.startTime} - {event.endTime}
                  </p>
                  <p className="mb-2">
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Participants Limit:</strong>{" "}
                    {event.participantsLimit}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
