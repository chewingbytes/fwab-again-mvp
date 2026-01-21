import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { toast } from "sonner";

import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { NewUser, Users, columns as baseColumns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Userdashboard() {
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState(baseColumns);

  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [originalEmail, setOriginalEmail] = useState<string | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>(""); // Define userRole in state
  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    email: "",
    roles: "user",
  });

  async function fetchData() {
    try {
      const response = await fetch("http://localhost:5050/api/users");

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const userData = await response.json();
      setUsers(userData);
    } catch (err) {
      setError((err as Error).message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUser() {
    if (
      !newUser.username.trim() ||
      !newUser.email.trim() ||
      !newUser.roles.trim()
    ) {
      toast.error(
        "All fields are required"
      );
      return;
    }
    try {
      const response = await fetch("http://localhost:5050/api/users/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
          username: newUser.username,
          email: newUser.email,
          roles: newUser.roles,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add user: ${errorText}`);
      }

      toast.success("new user added");
      setAddDialogOpen(false);
      setNewUser({ username: "", email: "", roles: "user"});
      fetchData();
    }
    catch (error) {
      console.error("Error adding user:", error);
      toast.error(`error: ${error}`);
    }
  }

  async function fetchUserRole() {
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
      const userRole = data.user.roles;
      setUserRole(userRole);
      console.log("userRole:", userRole);

      if (userRole === "admin") {
        const editColumn = {
          accessorKey: "edit",
          header: "Actions",
          cell: ({ row }: any) => (
            <Button
              className="rounded"
              onClick={() => handleEditClick(row.original)}
            >
              Edit
            </Button>
          ),
        };

        setColumns([...baseColumns, editColumn]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(selectedEmail: any) {
    if (!selectedUser) return;

    try {
      const response = await fetch(
        `http://localhost:5050/api/users/delete/${selectedEmail}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        console.log("Delete user successful");
        toast.success(`User deleted!`);
        fetchData();
      } else {
        const errorText = await response.json();
        throw new Error(`Failed to delete user: ${errorText}`);
      }
    } catch (error) {
      console.error("Error during delete user:", error);
    }
  }

  async function handleSaveChanges(selectedEmail: any) {
    if (!selectedUser) return;
    if (
      !selectedUser.username.trim() ||
      !selectedUser.email.trim() ||
      !selectedUser.roles.trim()
    ) {
      toast.error(
        "All fields are required"
      );
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5050/api/users/update/${selectedEmail}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: selectedUser.username,
            newEmail: selectedUser.email,
            roles: selectedUser.roles,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update user: ${errorText}`);
      }

      toast.success(`User Updated!`);

      console.log("User updated successfully.");
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(`Error: ${error}`);
    }
  }

  function handleEditClick(user: Users) {
    setSelectedUser({
      ...user,
      roles: typeof user.roles === "string" ? user.roles : "",
    });
    console.log("selected user:", user);
    setOriginalEmail(user.email);
    setDialogOpen(true);
  }

  useEffect(() => {
    fetchData();
    fetchUserRole();
  }, []);

  return (
    <>
      <Card>
        <div className="flex justify-between items-center">
        <CardHeader>
          <CardTitle>User Dashboard</CardTitle>
          <CardDescription>
            List of users retrieved from the API
          </CardDescription>
        </CardHeader>
        {userRole === "admin" && (
            <Button
              className="rounded mr-6"
              onClick={() => setAddDialogOpen(true)}
            >
              Add a user
            </Button>
          )}
        </div>

        <CardContent>
          {loading ? (
            <p className="text-center">Loading users...</p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : (
            <DataTable columns={columns} data={users} />
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Fill in the details of the new user and click "Add" to save.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, username: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, email: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <select
                id="roles"
                value={newUser.roles}
                onChange={(e) => {
                  const inputRole = e.target.value;
                  if (inputRole === "user" || inputRole === "admin") {
                    setNewUser((prev) => ({ ...prev, roles: inputRole }));
                  } else {
                    toast.error("Role must be either 'user' or 'admin'");
                  }
                }}
                className="col-span-3 bg-black"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <div className="flex flex-col space-y-2">
              <Button
                className="rounded"
                onClick={() => handleAddUser()}
              >
                Add user
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedUser && (
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to the profile here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={selectedUser.username}
                  onChange={(e) =>
                    setSelectedUser((prev) =>
                      prev ? { ...prev, username: e.target.value } : prev
                    )
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser((prev) =>
                      prev ? { ...prev, email: e.target.value } : prev
                    )
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <select
                  id="roles"
                  value={selectedUser.roles || ""}
                  onChange={(e) => {
                    const inputRole = e.target.value;
                    if (inputRole === "user" || inputRole === "admin") {
                      setSelectedUser((prev) =>
                        prev ? { ...prev, roles: inputRole } : prev
                      );
                    }
                  }}
                  className="col-span-3 bg-black"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <div className="flex flex-col space-y-2">
                <Button
                  className="rounded bg-red-500"
                  onClick={() => {
                    handleDelete(originalEmail);
                    setDialogOpen(false);
                  }}
                >
                  <span className="text-white">Delete user</span>
                </Button>
                <Button
                  className="rounded"
                  type="submit"
                  onClick={() => {
                    handleSaveChanges(originalEmail);
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
