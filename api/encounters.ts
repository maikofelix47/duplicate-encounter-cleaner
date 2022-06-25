import { baseAmrsUrl } from "./../conf/amrs-config";
import { GenerateBasicAuth } from "./../utils/generate-basic-auth";
const axios = require("axios");

export const VoidEncounter = (encounterUuid: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = `${baseAmrsUrl}/encounter/${encounterUuid}?!purge`;
    const basicAuth = GenerateBasicAuth();
    const config = {
      method: "delete",
      url: url,
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
    };

    axios(config)
      .then(function (response: any) {
        resolve(response.status);
      })
      .catch(function (error: any) {
        console.log(error);
        reject(error);
      });
  });
};
