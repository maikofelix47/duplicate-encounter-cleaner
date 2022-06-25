import {
  GetAllDuplicateEncountersAndMoveToVoidTable,
  GetAndVoidAmrsEncounters,
  PopulateAmrsDuplicateEncountersTable,
  TruncateEncountersToVoidTable,
} from "./services/encounter-service";

const CleanUpDuplicateEncounters = (
  startDate: string,
  endDate: string
): void => {
  TruncateEncountersToVoidTable()
    .then((result: any) => {
      return PopulateAmrsDuplicateEncountersTable(startDate, endDate);
    })
    .then((result: any) => {
      return GetAllDuplicateEncountersAndMoveToVoidTable();
    })
    .then((result: any) => {
      return GetAndVoidAmrsEncounters();
    })
    .catch((error) => {
      console.error("error", error);
    });
};

const startDate = "2020-01-01";
const endDate = "2020-01-21";

CleanUpDuplicateEncounters(startDate, endDate);
