import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/api";

interface Event {
  _id?: string;
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  participantsLimit: number;
}

interface NewEvent {
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  participantsLimit: number;
}

const baseColumns = [
  { accessorKey: "eventName", header: "Event Name" },
  { accessorKey: "eventDate", header: "Date" },
  { accessorKey: "location", header: "Location" },
  { accessorKey: "startTime", header: "Start Time" },
  { accessorKey: "endTime", header: "End Time" },
];

export default function EventsDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      toast.error("Please log in to view this page");
    }
  }, [isAuthenticated, navigate]);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState(baseColumns);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [originalEventName, setOriginalEventName] = useState<string | null>(
    null
  );
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    eventName: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    participantsLimit: 0,
  });

  // Create columns dynamically based on admin status
  useEffect(() => {
    if (isAdmin) {
      const columnsWithActions = [
        ...baseColumns,
        {
          accessorKey: "edit",
          header: "Actions",
          cell: ({ row }: any) => (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditClick(row.original)}
            >
              Edit
            </Button>
          ),
        },
      ];
      setColumns(columnsWithActions as any);
    } else {
      setColumns(baseColumns as any);
    }
  }, [isAdmin]);

  async function fetchData() {
    try {
      const eventData = await getEvents();
      setEvents(eventData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick(event: Event) {
    setSelectedEvent({
      ...event,
    });
    setOriginalEventName(event.eventName);
    setDialogOpen(true);
  }

  async function handleAddEvent() {
    if (
      !newEvent.eventName.trim() ||
      !newEvent.eventDate.trim() ||
      !newEvent.startTime.trim() ||
      !newEvent.endTime.trim() ||
      !newEvent.location.trim() ||
      !newEvent.description.trim() ||
      newEvent.participantsLimit <= 0
    ) {
      toast.error("All fields are required.");
      return;
    }
    try {
      await addEvent(newEvent);
      toast.success("New event added");
      setAddDialogOpen(false);
      setNewEvent({
        eventName: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        location: "",
        description: "",
        participantsLimit: 1,
      });
      fetchData();
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error(`Error: ${(error as Error).message}`);
    }
  }

  async function handleSaveChanges(eventName: any) {
    if (!selectedEvent) return;
    if (
      !selectedEvent.eventName.trim() ||
      !selectedEvent.eventDate.trim() ||
      !selectedEvent.startTime.trim() ||
      !selectedEvent.endTime.trim() ||
      !selectedEvent.location.trim() ||
      !selectedEvent.description.trim() ||
      selectedEvent.participantsLimit < 1
    ) {
      toast.error("All fields are required");
      return;
    }
    try {
      await updateEvent(eventName, {
        eventName: selectedEvent.eventName,
        eventDate: selectedEvent.eventDate,
        startTime: selectedEvent.startTime,
        endTime: selectedEvent.endTime,
        location: selectedEvent.location,
        description: selectedEvent.description,
        participantsLimit: selectedEvent.participantsLimit,
      });
      toast.success(`Event Updated!`);
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error(`Error: ${(error as Error).message}`);
    }
  }

  async function handleDeleteEvent(eventName: any) {
    if (!selectedEvent) return;
    try {
      await deleteEvent(eventName);
      toast.success("Event Deleted!");
      fetchData();
    } catch (error) {
      console.error("Error during delete event:", error);
      toast.error(`Error: ${(error as Error).message}`);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Card>
        <div className="flex justify-between items-center">
          <CardHeader>
            <CardTitle>Events Dashboard</CardTitle>
            <CardDescription>
              List of events retrieved from the API
            </CardDescription>
          </CardHeader>
          {isAdmin && (
            <Button
              className="rounded mr-6"
              onClick={() => setAddDialogOpen(true)}
            >
              Add Event
            </Button>
          )}
        </div>
        <CardContent>
          {loading ? (
            <p className="text-center">Loading events...</p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : (
            <DataTable columns={columns} data={events} />
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Enter event details and click "Add" to save.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eventName" className="text-right">
                Event Name
              </Label>
              <Input
                id="eventName"
                value={newEvent.eventName}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    eventName: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eventDate" className="text-right">
                Event Date
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={newEvent.eventDate}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    eventDate: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={newEvent.startTime}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={newEvent.endTime}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent((prev) => ({ ...prev, location: e.target.value }))
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="participantsLimit" className="text-right">
                Participants Limit
              </Label>
              <Input
                id="participantsLimit"
                type="number"
                value={
                  newEvent.participantsLimit === 0
                    ? ""
                    : newEvent.participantsLimit
                }
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setNewEvent((prev) => ({
                    ...prev,
                    participantsLimit: value === "" ? 0 : Number(value),
                  }));
                }}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="rounded" onClick={handleAddEvent}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {isAdmin && selectedEvent && (
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Modify the event details below. Click save when done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Event Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="eventName" className="text-right">
                  Event Name
                </Label>
                <Input
                  id="eventName"
                  value={selectedEvent.eventName}
                  onChange={(e) =>
                    setSelectedEvent((prev) =>
                      prev ? { ...prev, eventName: e.target.value } : prev
                    )
                  }
                  className="col-span-3"
                />
              </div>

              {/* Event Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="eventDate" className="text-right">
                  Event Date
                </Label>
                <Input
                  type="date"
                  id="eventDate"
                  value={selectedEvent.eventDate}
                  onChange={(e) =>
                    setSelectedEvent((prev) =>
                      prev ? { ...prev, eventDate: e.target.value } : prev
                    )
                  }
                  className="col-span-3"
                />
              </div>

              {/* Start Time */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">
                  Start Time
                </Label>
                <Input
                  type="time"
                  id="startTime"
                  value={selectedEvent.startTime}
                  onChange={(e) =>
                    setSelectedEvent((prev) =>
                      prev ? { ...prev, startTime: e.target.value } : prev
                    )
                  }
                  className="col-span-3"
                />
              </div>

              {/* End Time */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">
                  End Time
                </Label>
                <Input
                  type="time"
                  id="endTime"
                  value={selectedEvent.endTime}
                  onChange={(e) =>
                    setSelectedEvent((prev) =>
                      prev ? { ...prev, endTime: e.target.value } : prev
                    )
                  }
                  className="col-span-3"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={selectedEvent.location}
                  onChange={(e) =>
                    setSelectedEvent((prev) =>
                      prev ? { ...prev, location: e.target.value } : prev
                    )
                  }
                  className="col-span-3"
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={selectedEvent.description}
                  onChange={(e: any) =>
                    setSelectedEvent((prev) =>
                      prev ? { ...prev, description: e.target.value } : prev
                    )
                  }
                  className="col-span-3"
                />
              </div>

              {/* Participants Limit */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="participantsLimit" className="text-right">
                  Participants Limit
                </Label>
                <Input
                  id="participantsLimit"
                  type="number"
                  value={
                    selectedEvent.participantsLimit === 0
                      ? ""
                      : selectedEvent.participantsLimit
                  }
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    setSelectedEvent((prev) =>
                      prev
                        ? {
                            ...prev,
                            participantsLimit: value === "" ? 0 : Number(value),
                          }
                        : prev
                    );
                  }}
                  className="col-span-3"
                />
              </div>
            </div>

            <DialogFooter>
              <div className="flex flex-col space-y-2">
                <Button
                  className="rounded bg-red-500"
                  onClick={() => {
                    handleDeleteEvent(originalEventName);
                    setDialogOpen(false);
                  }}
                >
                  <span className="text-white">Delete Event</span>
                </Button>
                <Button
                  className="rounded"
                  onClick={() => {
                    handleSaveChanges(originalEventName);
                    setDialogOpen(false);
                  }}
                >
                  Save changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
