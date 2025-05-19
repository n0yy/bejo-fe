import React, { useState } from "react";
import { Database, AlertTriangle, Loader2 } from "lucide-react";
import { DiMysql, DiPostgresql } from "react-icons/di";
import { GrOracle } from "react-icons/gr";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useForm } from "react-hook-form";
import { Progress } from "./ui/progress";
import { useSession } from "next-auth/react";
import { ProcessStatus } from "@/lib/db/types";
import { Checkbox } from "./ui/checkbox";

export default function DatabaseConnector() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center space-x-2 border px-4 py-1.5 rounded-lg hover:bg-accent hover:cursor-pointer transition">
        <Database width={16} />
        <span className="text-sm">Connect to Database</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            🗃️ Connect Your Database
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Connect to your database to enable AI-powered SQL generation and
            data analysis.
          </DialogDescription>
          <Alert className="bg-yellow-50 border border-yellow-300">
            <AlertTriangle className="text-yellow-500" />
            <AlertTitle className="text-yellow-500">Warning!</AlertTitle>
            <AlertDescription>
              Besides being able to interact directly with the database, this
              feature automatically reads the entire database schema and uses it
              as context for Bejo. This enables Bejo to better understand user
              queries and generate precise and accurate SQL statements.
            </AlertDescription>
          </Alert>
        </DialogHeader>

        <DatabaseConnectionTabs onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function DatabaseConnectionTabs({ onSuccess }: { onSuccess: () => void }) {
  return (
    <Tabs defaultValue="mysql" className="w-full mt-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="mysql" className="flex items-center gap-1">
          <DiMysql size={20} />
          <span className="text-xs">MySQL</span>
        </TabsTrigger>
        <TabsTrigger value="postgresql" className="flex items-center gap-1">
          <DiPostgresql size={20} />
          <span className="text-xs">PostgreSQL</span>
        </TabsTrigger>
        <TabsTrigger value="oracle" className="flex items-center gap-1">
          <GrOracle size={18} />
          <span className="text-xs">Oracle</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="mysql">
        <DatabaseForm type="mysql" dbLabel="MySQL" onSuccess={onSuccess} />
      </TabsContent>

      <TabsContent value="postgresql">
        <DatabaseForm
          type="postgresql"
          dbLabel="PostgreSQL"
          onSuccess={onSuccess}
        />
      </TabsContent>

      <TabsContent value="oracle">
        <DatabaseForm
          type="oracle"
          dbLabel="Oracle DB"
          showServiceName={true}
          onSuccess={onSuccess}
        />
      </TabsContent>
    </Tabs>
  );
}

type FormData = {
  hostname: string;
  port: string;
  dbname: string;
  username: string;
  password: string;
  serviceName?: string;
  embed: boolean;
};

type DatabaseFormProps = {
  type: string;
  dbLabel: string;
  showServiceName?: boolean;
  onSuccess: () => void;
};

function DatabaseForm({
  type,
  dbLabel,
  showServiceName = false,
  onSuccess,
}: DatabaseFormProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [connecting, setConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    status: ProcessStatus | null;
    message: string;
    table?: string;
    progress?: { current: number; total: number };
  }>({
    status: null,
    message: "",
  });

  const form = useForm<FormData>({
    defaultValues: {
      hostname: "",
      port: type === "mysql" ? "3306" : type === "postgresql" ? "5432" : "1521",
      dbname: "",
      username: "",
      password: "",
      serviceName: "",
      embed: true,
    },
  });

  const onSubmit = async (values: FormData) => {
    if (!userId) {
      setConnectionStatus({
        status: ProcessStatus.ERROR,
        message: "User not authenticated",
      });
      return;
    }

    setConnecting(true);
    setConnectionStatus({
      status: ProcessStatus.CONNECTING,
      message: "Connecting to database...",
    });

    try {
      // For SSE connection
      const params = new URLSearchParams({
        userId,
        hostname: values.hostname,
        port: values.port,
        username: values.username,
        password: values.password,
        dbname: showServiceName ? values.serviceName || "" : values.dbname,
        type,
        embed: values.embed ? "true" : "false",
      });

      const eventSource = new EventSource(
        `/api/db/schema?${params.toString()}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        setConnectionStatus({
          status: data.status,
          message: data.message,
          table: data.table,
          progress: data.progress,
        });

        if (data.status === ProcessStatus.COMPLETED) {
          eventSource.close();
          setConnecting(false);
          setTimeout(() => {
            onSuccess();
          }, 1000);
        } else if (data.status === ProcessStatus.ERROR) {
          eventSource.close();
          setConnecting(false);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setConnecting(false);
        setConnectionStatus({
          status: ProcessStatus.ERROR,
          message: "Connection error. Please try again.",
        });
      };
    } catch (error) {
      setConnecting(false);
      setConnectionStatus({
        status: ProcessStatus.ERROR,
        message: "Failed to connect to database.",
      });
    }
  };

  return (
    <div className="space-y-3 pt-4">
      <p className="text-sm text-muted-foreground">
        🛠️ Enter your {dbLabel} credentials
      </p>

      {connectionStatus.status === ProcessStatus.ERROR && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{connectionStatus.message}</AlertDescription>
        </Alert>
      )}

      {connecting ? (
        <div className="space-y-4 py-2">
          <div className="flex justify-between text-sm">
            <span>{connectionStatus.message}</span>
            {connectionStatus.table && (
              <span className="text-muted-foreground">
                Table: {connectionStatus.table}
              </span>
            )}
          </div>

          {connectionStatus.progress && (
            <Progress
              value={
                (connectionStatus.progress.current /
                  connectionStatus.progress.total) *
                100
              }
              className="h-2"
            />
          )}

          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="hostname"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="🔗 Host (e.g., localhost)" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={`📍 Port (${field.value})`}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {showServiceName ? (
              <FormField
                control={form.control}
                name="serviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="📡 Service Name / SID" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="dbname"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="🗄️ Database Name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="👤 Username" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="🔒 Password"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="embed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Embed data for AI context (recommended)
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button className="w-full mt-2" type="submit">
              🚀 Connect to {dbLabel}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
