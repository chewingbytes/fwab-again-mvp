"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Event = {
   eventName: string
   eventDate: string
   startTime: string
   endTime: string
   location: string
   description: string
   participantsLimit: number
}

export type NewEvent = Omit<Event, "_id" | "id"> & {
    eventName: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
    participantsLimit: number;
  };

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "eventName",
    header: "Event Name",
  },
  {
    accessorKey: "eventDate",
    header: "Event Date",
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
  },
  {
    accessorKey: "endTime",
    header: "End Time",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "participantsLimit",
    header: "Participants Limit",
  },
];
