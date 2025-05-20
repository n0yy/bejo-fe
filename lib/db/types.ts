export type DBType = "mysql" | "oracle";

export interface DBConnection {
  type: DBType;
  connection: any;
}

export interface DBConnectionParams {
  userId: string;
  hostname: string;
  port: string | number;
  username: string;
  password: string;
  dbname: string;
  type: DBType;
  embed?: boolean;
}

export enum ProcessStatus {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  GETTING_TABLES = "getting_tables",
  GETTING_SCHEMA = "getting_schema",
  EMBEDDING = "embedding",
  COMPLETED = "completed",
  ERROR = "error",
  WARNING = "warning",
}

export interface SSEMessage {
  status: ProcessStatus;
  message: string;
  data?: any;
  table?: string;
  progress?: {
    current: number;
    total: number;
  };
}
