export interface MysqlConfig{
  connectionLimit?: number;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  multipleStatements?: boolean;
}