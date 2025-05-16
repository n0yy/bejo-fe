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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// Schema untuk form registrasi
const registerFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username harus minimal 2 karakter",
    })
    .max(12, {
      message: "Username tidak boleh lebih dari 12 karakter",
    }),
  email: z.string().email(),
  name: z
    .string()
    .min(2, {
      message: "Nama harus minimal 2 karakter",
    })
    .max(255, {
      message: "Nama terlalu panjang",
    }),
  division: z.enum(
    [
      "Engineering",
      "Technical Service",
      "QA/QC",
      "Manufacturing Development",
      "HR",
    ],
    {
      required_error: "Silakan pilih divisi Anda",
    }
  ),
  password: z.string().min(8, {
    message: "Password minimal 8 karakter",
  }),
});

// Type untuk form values
type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      division: undefined as any, // Fix untuk type issue dengan select
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    // Implementasi logika submit, misalnya API call
    console.log(values);

    // Contoh implementasi:
    // try {
    //   const response = await fetch('/api/register', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(values),
    //   });
    //
    //   if (response.ok) {
    //     // Redirect ke halaman login atau dashboard
    //     window.location.href = '/login';
    //   } else {
    //     // Handle error
    //     const data = await response.json();
    //     console.error('Registration failed:', data.message);
    //   }
    // } catch (error) {
    //   console.error('Error during registration:', error);
    // }
  }

  return (
    <>
      <h1 className="text-4xl font-bold text-center mb-8">
        Register to Start Q/A with BEJO
      </h1>

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
                  <Input placeholder="bejo@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Bejo Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="division"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Division</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a division" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Technical Service">
                      Technical Service
                    </SelectItem>
                    <SelectItem value="QA/QC">QA/QC</SelectItem>
                    <SelectItem value="Manufacturing Development">
                      Manufacturing Development
                    </SelectItem>
                    <SelectItem value="HR">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
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
            Register
          </Button>
        </form>
        <div className="text-center">
          <Link
            href="/login"
            className="underline text-sm text-slate-400 hover:text-slate-500"
          >
            Already have an account?
          </Link>
        </div>
      </Form>
    </>
  );
}
