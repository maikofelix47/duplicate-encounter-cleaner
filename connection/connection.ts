const mysql = require("mysql");
import { mysqlConfig } from "../conf/db-config";

const pool = mysql.createPool(mysqlConfig);

export function getConnectionPool(): Promise<any> {
  return new Promise((resolve, reject) => {
    resolve(pool);
  });
}
