export interface Encounter{
    encounter_id: number;
    encounter_type: number;
    patient_id: number;
    location_id: number;
    form_id: number;
    encounter_datetime: Date;
    creator: number;
    date_created: Date;
    voided: number;
    uuid: string;
    visit_id: number;
}

export interface DuplicateEncounter{
  encounter_id: number;
  encounter_type: number;
  patient_id: number;
  location_id: number;
  form_id: number;
  encounter_datetime: Date;
  creator: number;
  date_created: Date;
  voided: number;
  uuid: string;
  visit_id: number;
  duplicate_counts: number;
}