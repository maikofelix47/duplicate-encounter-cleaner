import { runSqlQuery } from "../utils/run-sql-script";
import { VoidEncounter } from "../api/encounters";
import { Encounter, DuplicateEncounter } from "../interfaces/encounter";
import moment = require("moment");

export const TruncateEncountersToVoidTable = (): Promise<any> => {
  const sqlQuery = "truncate etl.encounters_to_void;";
  return runSqlQuery(sqlQuery);
};

export const PopulateAmrsDuplicateEncountersTable = (
  startDate: string,
  endDate: string
): Promise<any> => {
  const sqlQuery = `replace into etl.duplicate_amrs_encounters(
    SELECT 
        e.*, COUNT(*) AS duplicate_counts, 0 as void_status
    FROM
        amrs.encounter e
    WHERE
        e.voided = 0
        and e.encounter_datetime > '${startDate}'
        and e.encounter_datetime < '${endDate}'
    GROUP BY e.patient_id , e.encounter_type , DATE(e.encounter_datetime)
    HAVING duplicate_counts > 1
    );`;

  return runSqlQuery(sqlQuery);
};

const VoidAmrsEncounter = (encounterUuid: string): Promise<any> => {
  return VoidEncounter(encounterUuid);
};

const GetOneDuplicateAmrsEncounter = (): Promise<any> => {
  const sqlQuery = `select * from etl.duplicate_amrs_encounters where void_status = 0 LIMIT 1;`;
  return runSqlQuery(sqlQuery);
};

const GetEncountersFromVoidTable = (): Promise<any> => {
  const sqlQuery = `select * from etl.encounters_to_void;`;
  return runSqlQuery(sqlQuery);
};

const PopulateEncountersToVoidTable = (
  personId: number,
  locationId: number,
  encounterType: number,
  encounterDate: Date,
  limit: number
) => {
  const sqlQuery = `replace into etl.encounters_to_void(
      select 
      * 
      from amrs.encounter e 
      where 
      e.patient_id = ${personId} 
      and DATE(e.encounter_datetime) = DATE("${moment(encounterDate).format(
        "YYYY-MM-DD HH:mm:ss"
      )}")
      and e.encounter_type = ${encounterType} 
      and e.location_id = ${locationId} 
      limit ${limit}
      );`;

  return runSqlQuery(sqlQuery);
};

const SetEncountersToVoidEntryStatusToDone = (encounterId: number) => {
  const sqlQuery = `
      UPDATE 
      etl.duplicate_amrs_encounters 
      set void_status = 1 
      where encounter_id = ${encounterId}
      ;`;

  return runSqlQuery(sqlQuery);
};

export const GetDuplicateEncounterEntriesCount = (): Promise<any> => {
  const sqlQuery = `
         SELECT 
             COUNT(*) AS 'all_duplicate_counters'
         FROM
             etl.duplicate_amrs_encounters
         WHERE
              void_status = 0;`;

  return runSqlQuery(sqlQuery);
};

export const GetDuplicateAndPopulateVoidTable = async (): Promise<any> => {
  try {
    const duplicateResults: DuplicateEncounter[] =
      await GetOneDuplicateAmrsEncounter();
    if (duplicateResults.length > 0) {
      const duplicateEntry = duplicateResults[0];
      const personId = duplicateEntry.patient_id;
      const locationId = duplicateEntry.location_id;
      const encounterType = duplicateEntry.encounter_type;
      const encounterDate = duplicateEntry.encounter_datetime;
      const limit = duplicateEntry.duplicate_counts - 1;
      const encounterId = duplicateEntry.encounter_id;
      await PopulateEncountersToVoidTable(
        personId,
        locationId,
        encounterType,
        encounterDate,
        limit
      );
      await SetEncountersToVoidEntryStatusToDone(encounterId);
    }

    return Promise.resolve("GetDuplicateAndPopulateVoidTable successfull..");
  } catch (e) {
    return Promise.reject("GetDuplicateAndPopulateVoidTable failed..");
  }
};

export const GetAllDuplicateEncountersAndMoveToVoidTable =
  async (): Promise<any> => {
    try {
      const duplicatesCountResults: { all_duplicate_counters: number }[] =
        await GetDuplicateEncounterEntriesCount();
      const duplicatesCount = duplicatesCountResults[0].all_duplicate_counters;
      if (duplicatesCount > 0) {
        await GetDuplicateAndPopulateVoidTable();
        return GetAllDuplicateEncountersAndMoveToVoidTable();
      }
      return Promise.resolve(
        "GetAllDuplicateEncountersAndMoveToVoidTable SUUCESS"
      );
    } catch (e: any) {
      return Promise.reject(
        "GetAllDuplicateEncountersAndMoveToVoidTable FAILED"
      );
    }
  };

const VoidEncounters = async (encounters: Encounter[]): Promise<any> => {
  let i = 1;
  const failedEncounters = [];
  for (let e of encounters) {
    console.log("encounter", e);
    console.log(`Voiding ${i} of ${encounters.length}`);
    i++;
    const encounterUuid = e.uuid;
    console.log(e.uuid);
    try {
      await VoidAmrsEncounter(encounterUuid);
      console.log(`${encounterUuid} updated...`);
    } catch (e) {
      console.log(`failed voiding ${encounterUuid}`);
      failedEncounters.push(encounterUuid);
    }
  }

  console.log("Failed Voiding the following encounters", failedEncounters);

  return Promise.resolve("All encounters voided...");
};

export const GetAndVoidAmrsEncounters = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    GetEncountersFromVoidTable()
      .then((encounters: DuplicateEncounter[]) => {
        console.log("encounters gotten", encounters);
        if (encounters.length > 0) {
          return VoidEncounters(encounters);
        } else {
          resolve("No encounters to void");
        }
      })
      .catch((error: any) => {
        console.log("GetAndVoidAmrsEncounters ERROR", error);
      });
  });
};
