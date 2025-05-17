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
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";

// Schema untuk form login
const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Type untuk form values
type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      console.log(session);
      if (session?.user?.role !== "admin") {
        router.push("/");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router, session]);

  async function onSubmit(values: LoginFormValues) {
    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!res?.ok) {
        form.setError("password", {
          message: "Invalid email or password",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
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
            {isLoading ? <FaSpinner className="animate-spin" /> : "Login"}
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
