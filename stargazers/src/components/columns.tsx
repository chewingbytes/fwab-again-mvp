"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Users = {
   roles: string
   username: string
   email: string
   createdAt: string
   updatedAt: string
}

export type NewUser = Omit<Users, 'createdAt' | 'updatedAt'>;

export const columns: ColumnDef<Users>[] = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "createdAt", 
    header: "Created At",
  },
  {
    accessorKey: "updatedAt", 
    header: "Updated At",
  },
  {
    accessorKey: "roles", 
    header: "Role",
    cell: ({ getValue }) => (getValue() as string[]), 
  },
];
