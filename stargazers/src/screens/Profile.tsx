import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { toast } from "sonner";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { useNavigate } from "react-router-dom"; // Import useNavigate

interface User {
  username: string;
  email: string;
  roles: string;
}

export function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5050/api/users/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        console.log("Logout successful");
        setUser(null);
        toast.success("Logged out!");
        navigate("/");
      } else {
        const errorText = await response.text();
        throw new Error(`Logout failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "http://localhost:5050/api/users/user-auth",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch user data: ${errorText}`);
        }

        const data = await response.json();
        console.log("Fetched user data:", data);
        setUser(data.user);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, []);

  const handleSaveChanges = async () => {
    try {
      if (!user) return;

      const response = await fetch(
        `http://localhost:5050/api/users/update/${user.email}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email: user.email,
            newEmail: email,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update user: ${errorText}`);
      }

      const data = await response.json();
      console.log("updated user data:", data);
      setUser(data.updatedUser);
      toast.success("Changes saved successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to save changes.");
    }
  };

  const handleEditClick = () => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-around">
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>View and edit your profile here</CardDescription>
            </div>
            <Sheet>
              <SheetTrigger onClick={handleEditClick} className="ml-10">
                <Button className="rounded">Edit</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit profile</SheetTitle>
                  <SheetDescription>
                    Make changes to your profile here. Click save when you're
                    done.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button
                      className="rounded"
                      type="submit"
                      onClick={handleSaveChanges}
                    >
                      Save changes
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          {user ? (
            <>
              <p>
                <strong>Name:</strong> {user.username}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.roles}
              </p>
              <Button
                className="rounded mt-8"
                onClick={() => {
                  handleLogout();
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <p>No user information available. Please log in.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
