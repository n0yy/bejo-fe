"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { use } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .optional()
    .refine(
      (fileList) => {
        if (!fileList || fileList.length === 0) return true; // optional
        const file = fileList[0];
        return [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
          "text/csv",
          "text/plain",
        ].includes(file.type);
      },
      {
        message: "Only PDF, DOCX, CSV, or TXT files are allowed.",
      }
    ),
});

export default function AddKnowledge({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Knowledge", href: "/dashboard" },
    { label: slug[1], isCurrentPage: true },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const fileRef = form.register("file");

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <div className="p-10">
      <DashboardHeader
        title={`Add Knowledge for ${slug[1]} Level`}
        breadcrumbs={breadcrumbs}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full p-10 space-y-4"
        >
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".pdf,.docx,.csv,.txt"
                    placeholder="shadcn"
                    {...fileRef}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
