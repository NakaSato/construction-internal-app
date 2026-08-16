import {
  CreateProjectRequest,
  EquipmentDetailsDto,
  LocationCoordinatesDto,
} from "../types/project";

/**
 * Input accepted by {@link toApiCreateProjectPayload} — the flat
 * `CreateProjectRequest` the UI builds, optionally already carrying the nested
 * objects (callers that construct the API shape directly are passed through).
 */
export type CreateProjectInput = CreateProjectRequest & {
  equipmentDetails?: EquipmentDetailsDto | null;
  locationCoordinates?: LocationCoordinatesDto | null;
};

/** The shape the API actually persists. */
export type ApiCreateProjectPayload = Omit<
  CreateProjectRequest,
  | "inverter125Kw"
  | "inverter80Kw"
  | "inverter60Kw"
  | "inverter40Kw"
  | "latitude"
  | "longitude"
> & {
  equipmentDetails?: EquipmentDetailsDto;
  locationCoordinates?: LocationCoordinatesDto;
};

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/**
 * Translate the flat `CreateProjectRequest` the UI builds into the nested shape
 * `POST /api/v1/projects` actually persists.
 *
 * The API accepts the flat `inverter*Kw` / `latitude` / `longitude` fields with a
 * 201 but silently drops them, creating the project with zeroed equipment and null
 * coordinates. Worse, they can only be set at creation time — `PATCH /projects/{id}`
 * ignores the nested objects too, so a project created from the flat payload cannot
 * be repaired afterwards.
 *
 * Nested objects supplied by the caller win; the flat fields are only used to fill
 * in what is missing.
 */
export function toApiCreateProjectPayload(
  project: CreateProjectInput
): ApiCreateProjectPayload {
  const {
    inverter125Kw,
    inverter80Kw,
    inverter60Kw,
    inverter40Kw,
    latitude,
    longitude,
    equipmentDetails,
    locationCoordinates,
    ...rest
  } = project;

  const payload: ApiCreateProjectPayload = { ...rest };

  if (equipmentDetails) {
    payload.equipmentDetails = equipmentDetails;
  } else if (
    isNumber(inverter125Kw) ||
    isNumber(inverter80Kw) ||
    isNumber(inverter60Kw) ||
    isNumber(inverter40Kw)
  ) {
    // Zeros are meaningful here ("no inverters of this size"), so any supplied
    // count is enough to send the object.
    payload.equipmentDetails = {
      inverter125kw: isNumber(inverter125Kw) ? inverter125Kw : 0,
      inverter80kw: isNumber(inverter80Kw) ? inverter80Kw : 0,
      inverter60kw: isNumber(inverter60Kw) ? inverter60Kw : 0,
      inverter40kw: isNumber(inverter40Kw) ? inverter40Kw : 0,
    };
  }

  if (locationCoordinates) {
    payload.locationCoordinates = locationCoordinates;
  } else if (isNumber(latitude) && isNumber(longitude)) {
    // The create form initialises both to 0, so treat (0, 0) as "not set" rather
    // than pinning every untouched project to Null Island.
    if (latitude !== 0 || longitude !== 0) {
      payload.locationCoordinates = { latitude, longitude };
    }
  }

  return payload;
}
