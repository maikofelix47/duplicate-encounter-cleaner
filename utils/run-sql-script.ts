import { getConnectionPool } from "../connection/connection";

export function runSqlQuery(sqlQuery: string): Promise<any> {
  return new Promise((resolve, reject) => {
    getConnectionPool()
      .then((pool: any) => {
        pool.query(sqlQuery, (error: any, results: any, fields: any) => {
          if (error) {
            console.log("Error", error);
            const errorPayload = {
              sqlQuery: sqlQuery,
              error: {
                sqlMessage: error,
              },
            };
            reject(errorPayload);
          } else {
            resolve(results);
          }
        });
      })
      .catch((error: any) => {
        reject(error);
      });
  });
}
