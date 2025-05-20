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

  const emitStatus = async (
    status: ProcessStatus,
    message: string,
    table?: string,
    progress?: { current: number; total: number }
  ) => {
    const sseMessage: SSEMessage = {
      status,
      message,
      table,
      progress,
    };
    await writer.write(
      encoder.encode(`data: ${JSON.stringify(sseMessage)}\n\n`)
    );
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

      if (embed) {
        const mem0Client = await createMem0Client();
        for (let i = 0; i < tables.length; i++) {
          const table = tables[i];
          try {
            emitStatus(
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

            await embedTableData(
              mem0Client,
              tableData,
              userId,
              table,
              emitStatus
            );
          } catch (error: any) {
            emitStatus(
              ProcessStatus.ERROR,
              `Error processing table ${table}: ${error.message}`,
              table
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
      }

      await emitStatus(
        ProcessStatus.COMPLETED,
        "Database schema extraction completed successfully",
        undefined,
        {
          current: tables.length,
          total: tables.length,
        }
      );

      await writer.write(
        encoder.encode(
          `data: ${JSON.stringify({
            status: ProcessStatus.COMPLETED,
            message: "Process completed",
            data: { schemaText: allSchemaText },
          })}\n\n`
        )
      );
    } catch (error: any) {
      await emitStatus(
        ProcessStatus.ERROR,
        `Error processing database schema: ${error.message}`,
        undefined
      );
    } finally {
      try {
        if (connection) {
          await closeConnection(connection, type as any);
        }
      } catch (error) {
        console.error("Error closing database connection:", error);
      }
      await writer.close();
    }
  };

  processDBSchema();
  // Update firestore (user)
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
  });
  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      hostname,
      port,
      username,
      password,
      dbname,
      type,
      embed = false,
    } = await request.json();

    // Koneksi ke database
    const dbConnection = await createConnection({
      userId,
      hostname,
      port,
      username,
      password,
      dbname,
      type,
    });

    // Ekstrak schema
    const schemaText = await extractSchemaWithSamples(
      dbConnection.connection,
      dbConnection.type
    );

    // Embed data jika diperlukan
    if (embed) {
      const mem0Client = createMem0Client();
      const tables = await getTables(
        dbConnection.connection,
        dbConnection.type
      );

      for (const table of tables) {
        try {
          const schema = await getTableSchema(
            dbConnection.connection,
            dbConnection.type,
            table
          );
          const samples = await getSampleData(
            dbConnection.connection,
            dbConnection.type,
            table
          );
          const tableData = schema + "\nSample Data:\n" + samples + "\n\n";

          await mem0Client.add(tableData, {
            agent_id: "agent-1",
            metadata: {
              category: "database",
              tableName: table,
            },
          });
        } catch (error) {
          console.error(`Failed to embed table ${table}:`, error);
        }
      }
    }

    // Tutup koneksi
    await closeConnection(dbConnection.connection, dbConnection.type);

    return Response.json(
      {
        userId,
        message: "Database schema has embeded!",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in DB schema extraction:", error);
    return Response.json(
      { error: error.message || "Failed to extract DB schema" },
      { status: 500 }
    );
  }
}
