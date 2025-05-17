"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

// Schema untuk form login
const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Type untuk form values
type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(values: LoginFormValues) {
    // Implementasi logika login, misalnya API call
    console.log(values);

    // Contoh implementasi:
    // try {
    //   const response = await fetch('/api/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(values),
    //   });
    //
    //   if (response.ok) {
    //     // Redirect ke dashboard setelah login berhasil
    //     window.location.href = '/dashboard';
    //   } else {
    //     // Handle error
    //     const data = await response.json();
    //     console.error('Login failed:', data.message);
    //   }
    // } catch (error) {
    //   console.error('Error during login:', error);
    // }
  }

  return (
    <>
      <h1 className="text-4xl font-bold text-center mb-8">Login</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 mb-5 w-full max-w-md"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="bedo72" {...field} />
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
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full hover:cursor-pointer">
            Login
          </Button>
        </form>
        <div className="text-center">
          <Link
            href="/register"
            className="underline text-sm text-slate-400 hover:text-slate-500"
          >
            Don't have an account? Register here
          </Link>
        </div>
      </Form>
    </>
  );
}
