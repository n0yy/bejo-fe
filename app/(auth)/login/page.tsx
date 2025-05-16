// File: app/(auth)/login/page.tsx
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

// Schema untuk form login
const loginFormSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(8),
});

// Type untuk form values
type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

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
      <h1 className="text-4xl font-bold text-center mb-8">
        Login to BEJO Assistant
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 mb-5 w-full max-w-md"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
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
          <Button type="submit" className="w-full">
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
