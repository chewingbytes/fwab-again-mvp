"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";


import { useNavigate } from "react-router-dom";
import { getUsers } from "@/lib/localData";

import { ArrowLeftIcon, RocketIcon } from "@radix-ui/react-icons";
import { useState } from "react";

// Updated Zod schema for login with username
const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(20, { message: "Username must not exceed 20 characters." })
    .nonempty({ message: "Username is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(128, { message: "Password must not exceed 128 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one digit." })
    .nonempty({ message: "Password is required." }),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "", 
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: { username: string; email: string; password: string }) => {
    setGeneralError("");
    try {
      const users = getUsers();
      const user = users.find(
        (u) => u.username === data.username && u.email === data.email
      );
      if (!user) {
        setGeneralError("User not found or incorrect username/email");
        return;
      }
      // If password is hashed, skip check for demo; else compare directly
      let isPasswordValid = false;
      if (user.password && user.password.startsWith("$2b$")) {
        isPasswordValid = true; // Accept any password for demo
      } else {
        isPasswordValid = data.password === user.password;
      }
      if (!isPasswordValid) {
        setGeneralError("Invalid password");
        return;
      }
      navigate("/profile");
    } catch (error) {
      setGeneralError("Login failed");
      console.error(error);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <div className="w-1/2">
          <h1 className="text-8xl barrio">
            Login to <span className="text-yellow-300">Stargazers</span> @{" "}
            <span className="text-red-500">TP</span>
          </h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* New username field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      className="rounded"
                      type="text"
                      placeholder="Your username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className="rounded"
                      type="email"
                      placeholder="example@domain.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      className="rounded"
                      type="password"
                      placeholder="••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Please enter your password.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {generalError && <p className="text-red-500">{generalError}</p>}

            <Button className="rounded" type="submit">
              <RocketIcon /> Login
            </Button>
          </form>
        </Form>
        <a href="/">
          <Button className="rounded mt-3">
            <ArrowLeftIcon /> Back
          </Button>
        </a>
      </div>
    </>
  );
}
