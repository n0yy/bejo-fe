import { NextResponse, NextRequest } from "next/server";
import { createConnection, closeConnection } from "@/lib/db/connection";
import {
  extractSchemaWithSamples,
  getTables,
  getTableSchema,
  getSampleData,
} from "@/lib/db/schema";
import { createMem0Client, embedTableData } from "@/lib/mem0/client";
import { ProcessStatus, SSEMessage } from "@/lib/db/types";
import { getUserById, getUserDocRefById } from "@/lib/firebase/user";
import { updateDoc } from "firebase/firestore";
import { hash } from "bcryptjs";

async function embedWithRetry(
  client: any,
  data: string,
  userId: string,
  table: string,
  emitStatus: (
    status: ProcessStatus,
    message: string,
    table?: string,
    progress?: { current: number; total: number }
  ) => Promise<void>,
  retries = 3,
  delay = 1000
): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await embedTableData(client, data, table, emitStatus);
      return true;
    } catch (error: any) {
      if (attempt === retries) {
        console.warn(
          `Failed to embed table ${table} after ${retries} attempts: ${
            error.message || error
          }`
        );
        await emitStatus(
          ProcessStatus.WARNING,
          `Skipped table ${table} due to API error after ${retries} attempts: ${
            error.message || "Server Error"
          }`,
          table
        );
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  return false;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const hostname = searchParams.get("hostname");
  const port = searchParams.get("port");
  const username = searchParams.get("username");
  const password = searchParams.get("password");
  const dbname = searchParams.get("dbname");
  const type = searchParams.get("type");
  const embed = searchParams.get("embed") === "true";

  if (
    !userId ||
    !hostname ||
    !port ||
    !username ||
    !password ||
    !dbname ||
    !type
  ) {
    return new NextResponse("Missing required parameters", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const controller = new AbortController();
  const signal = request.signal;

  // Handle client abort
  signal.addEventListener("abort", () => {
    console.log(`Client aborted request for userId: ${userId}`);
    writer.close().catch(() => {});
  });

  const emitStatus = async (
    status: ProcessStatus,
    message: string,
    table?: string,
    progress?: { current: number; total: number }
  ) => {
    if (signal.aborted) return;
    try {
      const sseMessage: SSEMessage = { status, message, table, progress };
      await writer.write(
        encoder.encode(`data: ${JSON.stringify(sseMessage)}\n\n`)
      );
    } catch (error) {
      console.warn("Failed to write to stream:", error);
    }
  };

  const processDBSchema = async () => {
    let connection;
    try {
      const dbConnection = await createConnection(
        {
          userId,
          hostname,
          port,
          username,
          password,
          dbname,
          type: type as any,
        },
        emitStatus
      );
      connection = dbConnection.connection;

      const tables = await getTables(connection, dbConnection.type, emitStatus);
      let allSchemaText = "";
      let processedTables = 0;
      const failedTables: string[] = [];

      if (embed) {
        const mem0Client = await createMem0Client();
        for (let i = 0; i < tables.length; i++) {
          if (signal.aborted) break;
          const table = tables[i];
          try {
            await emitStatus(
              ProcessStatus.GETTING_SCHEMA,
              `Processing table ${i + 1}/${tables.length}: ${table}`,
              table,
              { current: i + 1, total: tables.length }
            );

            const schema = await getTableSchema(
              connection,
              dbConnection.type,
              table
            );
            const samples = await getSampleData(
              connection,
              dbConnection.type,
              table
            );
            const tableData = schema + "\nSample Data:\n" + samples + "\n\n";
            allSchemaText += tableData;

            const embedded = await embedWithRetry(
              mem0Client,
              tableData,
              userId,
              table,
              emitStatus
            );
            if (embedded) {
              processedTables++;
            } else {
              failedTables.push(table);
            }
          } catch (error: any) {
            console.warn(`Skipping table ${table}: ${error.message}`);
            failedTables.push(table);
            await emitStatus(
              ProcessStatus.WARNING,
              `Skipped table ${table} due to error: ${error.message}`,
              table,
              { current: i + 1, total: tables.length }
            );
            continue;
          }
        }
      } else {
        allSchemaText = await extractSchemaWithSamples(
          connection,
          dbConnection.type,
          emitStatus
        );
        processedTables = tables.length;
      }

      if (!signal.aborted) {
        await emitStatus(
          ProcessStatus.COMPLETED,
          `Database schema extraction completed. Processed ${processedTables}/${
            tables.length
          } tables. Failed tables: ${
            failedTables.length > 0 ? failedTables.join(", ") : "none"
          }`,
          undefined,
          { current: processedTables, total: tables.length }
        );

        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              status: ProcessStatus.COMPLETED,
              message: "Process completed",
              data: {
                schemaText: allSchemaText,
                processedTables,
                totalTables: tables.length,
                failedTables,
              },
            })}\n\n`
          )
        );
      }
    } catch (error: any) {
      if (!signal.aborted) {
        await emitStatus(
          ProcessStatus.ERROR,
          `Error processing database schema: ${error.message}`
        );
      }
    } finally {
      try {
        if (connection) {
          await closeConnection(connection, type as any);
        }
      } catch (error) {
        console.error("Error closing database connection:", error);
      }
      try {
        await writer.close();
      } catch (error) {
        console.warn("Error closing stream:", error);
      }
    }
  };

  processDBSchema().catch((error) => {
    console.error("Unhandled error in processDBSchema:", error);
  });

  const userRef = getUserDocRefById(userId);
  const hashedPassword = await hash(password, 10);
  await updateDoc(userRef, {
    dbCreds: {
      type,
      host: hostname,
      port,
      username,
      password: hashedPassword,
      dbname,
    },
  }).catch((error) => {
    console.error("Error updating Firestore:", error);
  });

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
