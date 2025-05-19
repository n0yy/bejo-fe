import mysql from "mysql2/promise";
import OracleDB from "oracledb";
import { DBConnectionParams, DBType, ProcessStatus } from "./types";

export async function createConnection(
  params: DBConnectionParams,
  emitStatus?: (status: ProcessStatus, message: string) => void
) {
  const { hostname, port, username, password, dbname, type } = params;
  const dbType = type.toLowerCase() as DBType;
  let conn;

  try {
    emitStatus?.(
      ProcessStatus.CONNECTING,
      `Connecting to ${dbType} database at ${hostname}:${port}...`
    );

    if (dbType === "mysql") {
      conn = await mysql.createConnection({
        host: hostname,
        port: parseInt(port.toString()),
        user: username,
        password: password,
        database: dbname,
      });
    } else if (dbType === "oracle") {
      conn = await OracleDB.getConnection({
        user: username,
        password: password,
        connectString: `${hostname}:${port}/${dbname}`,
      });
    } else {
      throw new Error("Invalid/Unsupported database type");
    }

    emitStatus?.(
      ProcessStatus.CONNECTED,
      `Successfully connected to ${dbType} database`
    );

    return {
      connection: conn,
      type: dbType,
    };
  } catch (error: any) {
    emitStatus?.(
      ProcessStatus.ERROR,
      `Failed to connect to database: ${error.message}`
    );
    throw error;
  }
}

export async function closeConnection(connection: any, type: DBType) {
  if (type === "mysql") {
    const mysqlConn = connection as mysql.Connection;
    await mysqlConn.end();
  } else if (type === "oracle") {
    const oracleConn = connection as OracleDB.Connection;
    await oracleConn.close();
  }
}
