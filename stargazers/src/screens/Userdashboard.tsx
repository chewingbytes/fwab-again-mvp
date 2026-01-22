import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { toast } from "sonner";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUsers, addUser, updateUser, deleteUser } from "@/lib/api";

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

interface Users {
  _id?: string;
  username: string;
  email: string;
  roles: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NewUser {
  username: string;
  email: string;
  roles: string;
}

const baseColumns = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "roles",
    header: "Role",
  },
];

export default function Userdashboard() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      toast.error("Please log in to view this page");
    }
  }, [isAuthenticated, navigate]);

  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState(baseColumns);

  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [originalEmail, setOriginalEmail] = useState<string | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    username: "",
    email: "",
    roles: "user",
  });

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
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    try {
      const userData = await getUsers();
      setUsers(userData);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick(user: Users) {
    setSelectedUser({
      ...user,
      roles: typeof user.roles === "string" ? user.roles : "",
    });
    setOriginalEmail(user.email);
    setDialogOpen(true);
  }

  async function handleAddUser() {
    if (
      !newUser.username.trim() ||
      !newUser.email.trim() ||
      !newUser.roles.trim()
    ) {
      toast.error("All fields are required");
      return;
    }
    try {
      await addUser({
        username: newUser.username,
        email: newUser.email,
        roles: newUser.roles,
      });
      toast.success("new user added");
      setAddDialogOpen(false);
      setNewUser({ username: "", email: "", roles: "user" });
      fetchData();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(`error: ${(error as Error).message}`);
    }
  }

  async function handleDelete(selectedEmail: any) {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedEmail);
      toast.success(`User deleted!`);
      fetchData();
    } catch (error) {
      console.error("Error during delete user:", error);
      toast.error(`Error: ${(error as Error).message}`);
    }
  }

  async function handleSaveChanges(selectedEmail: any) {
    if (!selectedUser) return;
    if (
      !selectedUser.username.trim() ||
      !selectedUser.email.trim() ||
      !selectedUser.roles.trim()
    ) {
      toast.error("All fields are required");
      return;
    }
    try {
      await updateUser(selectedEmail, {
        username: selectedUser.username,
        email: selectedUser.email,
        roles: selectedUser.roles,
      });
      toast.success(`User Updated!`);
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating user:", error);
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
            <CardTitle>User Dashboard</CardTitle>
            <CardDescription>
              List of users retrieved from the API
            </CardDescription>
          </CardHeader>
          {isAdmin && (
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
          ) : !isAdmin ? (
            <p className="text-center text-muted-foreground">
              Admin access required to view user data
            </p>
          ) : (
            <DataTable columns={columns} data={users} />
          )}
        </CardContent>
      </Card>

      {isAdmin && (
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
              <Button className="rounded" onClick={() => handleAddUser()}>
                Add user
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}

      {isAdmin && selectedUser && (
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
                    setSelectedUser((prev: Users | null) =>
                      prev ? { ...prev, username: e.target.value } : prev,
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
                    setSelectedUser((prev: Users | null) =>
                      prev ? { ...prev, email: e.target.value } : prev,
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
                      setSelectedUser((prev: Users | null) =>
                        prev ? { ...prev, roles: inputRole } : prev,
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
