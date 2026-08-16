import { describe, it, expect } from "vitest";
import {
  CreateProjectInput,
  toApiCreateProjectPayload,
} from "../projectPayload";

const base: CreateProjectInput = {
  projectName: "Solar Rooftop - Test Site",
  address: "1 Test Rd, Bangkok 10110",
  startDate: "2026-03-02T00:00:00Z",
  projectManagerId: "00000000-0000-0000-0000-000000000001",
};

describe("toApiCreateProjectPayload", () => {
  it("moves flat inverter counts into equipmentDetails", () => {
    const payload = toApiCreateProjectPayload({
      ...base,
      inverter125Kw: 8,
      inverter80Kw: 2,
      inverter60Kw: 0,
      inverter40Kw: 1,
    });

    expect(payload.equipmentDetails).toEqual({
      inverter125kw: 8,
      inverter80kw: 2,
      inverter60kw: 0,
      inverter40kw: 1,
    });
  });

  it("moves flat latitude/longitude into locationCoordinates", () => {
    const payload = toApiCreateProjectPayload({
      ...base,
      latitude: 13.6683,
      longitude: 100.6103,
    });

    expect(payload.locationCoordinates).toEqual({
      latitude: 13.6683,
      longitude: 100.6103,
    });
  });

  it("strips the flat fields the API silently drops", () => {
    const payload = toApiCreateProjectPayload({
      ...base,
      inverter125Kw: 8,
      latitude: 13.6683,
      longitude: 100.6103,
    });

    expect(payload).not.toHaveProperty("inverter125Kw");
    expect(payload).not.toHaveProperty("inverter80Kw");
    expect(payload).not.toHaveProperty("latitude");
    expect(payload).not.toHaveProperty("longitude");
  });

  it("preserves the other project fields untouched", () => {
    const payload = toApiCreateProjectPayload({
      ...base,
      clientInfo: "Siam Logistics Co., Ltd.",
      totalCapacityKw: 1250.5,
      connectionType: "MV",
    });

    expect(payload).toMatchObject({
      projectName: "Solar Rooftop - Test Site",
      address: "1 Test Rd, Bangkok 10110",
      clientInfo: "Siam Logistics Co., Ltd.",
      totalCapacityKw: 1250.5,
      connectionType: "MV",
      projectManagerId: "00000000-0000-0000-0000-000000000001",
    });
  });

  it("omits both nested objects when nothing was supplied", () => {
    const payload = toApiCreateProjectPayload(base);

    expect(payload.equipmentDetails).toBeUndefined();
    expect(payload.locationCoordinates).toBeUndefined();
  });

  it("treats the form's (0, 0) default as unset coordinates", () => {
    const payload = toApiCreateProjectPayload({
      ...base,
      latitude: 0,
      longitude: 0,
    });

    expect(payload.locationCoordinates).toBeUndefined();
  });

  it("keeps explicit zero inverter counts", () => {
    const payload = toApiCreateProjectPayload({
      ...base,
      inverter125Kw: 0,
      inverter80Kw: 0,
      inverter60Kw: 0,
      inverter40Kw: 0,
    });

    expect(payload.equipmentDetails).toEqual({
      inverter125kw: 0,
      inverter80kw: 0,
      inverter60kw: 0,
      inverter40kw: 0,
    });
  });

  it("lets caller-supplied nested objects win over the flat fields", () => {
    const payload = toApiCreateProjectPayload({
      ...base,
      inverter125Kw: 1,
      latitude: 1,
      longitude: 1,
      equipmentDetails: {
        inverter125kw: 48,
        inverter80kw: 12,
        inverter60kw: 6,
        inverter40kw: 4,
      },
      locationCoordinates: { latitude: 14.7167, longitude: 101.9833 },
    });

    expect(payload.equipmentDetails).toEqual({
      inverter125kw: 48,
      inverter80kw: 12,
      inverter60kw: 6,
      inverter40kw: 4,
    });
    expect(payload.locationCoordinates).toEqual({
      latitude: 14.7167,
      longitude: 101.9833,
    });
  });

  it("fills missing inverter sizes with zero when only some are given", () => {
    const payload = toApiCreateProjectPayload({
      ...base,
      inverter80Kw: 3,
    });

    expect(payload.equipmentDetails).toEqual({
      inverter125kw: 0,
      inverter80kw: 3,
      inverter60kw: 0,
      inverter40kw: 0,
    });
  });
});
