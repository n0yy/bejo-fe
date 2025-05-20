// components/SettingsForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUser, updateUserDbCreds } from "@/lib/firebase/user";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types/user";

// Mendefinisikan skema validasi form
const userFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Nama harus memiliki minimal 2 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  division: z.string().min(1, { message: "Divisi tidak boleh kosong" }),
  // Database credentials
  type: z.string().min(1, { message: "Tipe database tidak boleh kosong" }),
  host: z.string().min(1, { message: "Host tidak boleh kosong" }),
  port: z.string().min(1, { message: "Port tidak boleh kosong" }),
  username: z.string().min(1, { message: "Username tidak boleh kosong" }),
  password: z.string().min(1, { message: "Password tidak boleh kosong" }),
  dbname: z.string().min(1, { message: "Nama database tidak boleh kosong" }),
});

export default function SettingsForm({ initialUser }: { initialUser: User }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      division: "",
      type: "",
      host: "",
      port: "",
      username: "",
      password: "",
      dbname: "",
    },
  });

  useEffect(() => {
    if (initialUser) {
      form.reset({
        name: initialUser.name || "",
        email: initialUser.email || "",
        division: initialUser.division || "",
        // Setup database credentials
        type: initialUser.dbCreds?.type || "",
        host: initialUser.dbCreds?.host || "",
        port: initialUser.dbCreds?.port || "",
        username: initialUser.dbCreds?.username || "",
        password: "",
        dbname: initialUser.dbCreds?.dbname || "",
      });
    }
  }, [initialUser, form]);

  const onSubmit = async (data: z.infer<typeof userFormSchema>) => {
    setLoading(true);
    try {
      // Memisahkan data user dan database credentials
      const userData = {
        name: data.name,
        email: data.email,
        division: data.division,
      };

      const dbCreds = {
        type: data.type,
        host: data.host,
        port: data.port,
        username: data.username,
        password: data.password,
        dbname: data.dbname,
      };

      // Update data user
      await updateUser(initialUser.id, userData);

      // Update database credentials
      await updateUserDbCreds(initialUser.id, dbCreds);

      toast.success("Data is updated successfully!");

      // Refresh halaman untuk mendapatkan data terbaru
      router.refresh();
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("Error updating data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-medium">User Data</h2>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama" {...field} />
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
                  <Input placeholder="Masukkan email" type="email" {...field} />
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
                <FormLabel>Divisi</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan divisi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-xl font-medium">Database Credentials</h2>

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Database Type</FormLabel>
                <FormControl>
                  <Input placeholder="mysql, postgresql, etc" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host</FormLabel>
                <FormControl>
                  <Input placeholder="localhost or IP address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input placeholder="3306, 5432, etc" {...field} />
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
                  <Input placeholder="Database username" {...field} />
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
                    type="password"
                    placeholder="Database password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dbname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Database Name</FormLabel>
                <FormControl>
                  <Input placeholder="Database name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="mt-6" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Semua Perubahan"}
        </Button>
      </form>
    </Form>
  );
}
