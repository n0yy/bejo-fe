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
import { useState, useEffect, useMemo, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

type ErrorType =
  | "CredentialsSignin"
  | "AccountNotApproved"
  | "InvalidCredentials"
  | "AuthenticationFailed";

function ErrorHandler() {
  const searchParams = useSearchParams();

  const errorMessageMap = useMemo(
    () =>
      ({
        CredentialsSignin: "Invalid email or password.",
        AccountNotApproved: "Your account is not yet approved.",
        InvalidCredentials: "Invalid email or password.",
        AuthenticationFailed: "Authentication failed. Please try again.",
        default: "An unexpected error occurred. Please try again.",
      } as Record<ErrorType | "default", string>),
    []
  );

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      toast.error(
        errorMessageMap[errorParam as ErrorType] || errorMessageMap.default
      );
    }
  }, [searchParams, errorMessageMap]);

  return null;
}

function LoginForm() {
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

  const errorMessageMap = useMemo(
    () =>
      ({
        CredentialsSignin: "Invalid email or password.",
        AccountNotApproved: "Your account is not yet approved.",
        InvalidCredentials: "Invalid email or password.",
        AuthenticationFailed: "Authentication failed. Please try again.",
        default: "An unexpected error occurred. Please try again.",
      } as Record<ErrorType | "default", string>),
    []
  );

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router, session, status]);

  async function onSubmit(values: LoginFormValues) {
    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (res?.error) {
        toast.error(
          errorMessageMap[res.error as ErrorType] || errorMessageMap.default
        );
        return;
      }

      if (res?.url) {
        router.push(res.url);
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
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
                  <Input placeholder="user@example.com" {...field} />
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

function LoginPageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <FaSpinner className="animate-spin mx-auto mb-4 text-2xl" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginForm />
      <ErrorHandler />
    </Suspense>
  );
}
