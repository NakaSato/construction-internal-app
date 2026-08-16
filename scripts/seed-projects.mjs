#!/usr/bin/env node
/**
 * Seed the Solar Projects API with demo project data, then read it back.
 *
 * Usage:
 *   bun scripts/seed-projects.mjs            # create seed projects + verify
 *   bun scripts/seed-projects.mjs --list     # read-only: fetch and print projects
 *
 * Env overrides:
 *   API_BASE_URL   default: value of VITE_API_BASE_URL in .env
 *   API_USERNAME   default: admin@example.com
 *   API_PASSWORD   default: Admin123!
 *
 * Note: the API persists equipment and coordinates only via the *nested*
 * `equipmentDetails` / `locationCoordinates` objects. The flat fields on
 * CreateProjectRequest (inverter125Kw, latitude, ...) are silently dropped.
 */

const BASE_URL = (
  process.env.API_BASE_URL ?? "https://construction-dotnet-rest-api.onrender.com"
).replace(/\/$/, "");
const USERNAME = process.env.API_USERNAME ?? "admin@example.com";
const PASSWORD = process.env.API_PASSWORD ?? "Admin123!";

const listOnly = process.argv.includes("--list");

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status} ${res.statusText}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function login() {
  const res = await api("/api/v1/auth/login", {
    method: "POST",
    body: { username: USERNAME, password: PASSWORD },
  });
  const { token, user } = res.data;
  console.log(`🔑 Logged in as ${user.username} (${user.roleName})`);
  return { token, userId: user.userId };
}

/** Projects to seed. `status` is applied after creation (create always yields "Planning"). */
const seedProjects = (managerId) => [
  {
    status: "InProgress",
    payload: {
      projectName: "Solar Rooftop - Bangkok Distribution Center",
      address: "88 Bangna-Trad Rd, Bang Na, Bangkok 10260",
      clientInfo: "Siam Logistics Co., Ltd.",
      startDate: "2026-03-02T00:00:00Z",
      estimatedEndDate: "2026-08-28T00:00:00Z",
      projectManagerId: managerId,
      team: "Alpha Installation Crew",
      connectionType: "MV",
      connectionNotes: "MV connection via existing 24kV substation",
      totalCapacityKw: 1250.5,
      pvModuleCount: 2280,
      equipmentDetails: { inverter125kw: 8, inverter80kw: 2, inverter60kw: 0, inverter40kw: 0 },
      locationCoordinates: { latitude: 13.6683, longitude: 100.6103 },
      ftsValue: 4200000,
      revenueValue: 18500000,
      pqmValue: 950000,
    },
  },
  {
    status: "InProgress",
    payload: {
      projectName: "Solar Farm - Nakhon Ratchasima Phase 1",
      address: "Highway 304, Pak Thong Chai, Nakhon Ratchasima 30150",
      clientInfo: "Isan Renewable Energy PCL",
      startDate: "2026-01-15T00:00:00Z",
      estimatedEndDate: "2026-11-30T00:00:00Z",
      projectManagerId: managerId,
      team: "Bravo Field Crew",
      connectionType: "HV",
      connectionNotes: "115kV transmission tie-in, EGAT coordination required",
      totalCapacityKw: 8400,
      pvModuleCount: 15300,
      equipmentDetails: { inverter125kw: 48, inverter80kw: 12, inverter60kw: 6, inverter40kw: 4 },
      locationCoordinates: { latitude: 14.7167, longitude: 101.9833 },
      ftsValue: 22000000,
      revenueValue: 124000000,
      pqmValue: 6300000,
    },
  },
  {
    status: "InProgress",
    payload: {
      projectName: "Solar Rooftop - Chonburi Industrial Estate",
      address: "Amata City Industrial Estate, Chonburi 20000",
      clientInfo: "Amata Manufacturing Co., Ltd.",
      startDate: "2026-02-10T00:00:00Z",
      estimatedEndDate: "2026-09-15T00:00:00Z",
      projectManagerId: managerId,
      team: "Charlie Rooftop Crew",
      connectionType: "MV",
      connectionNotes: "22kV MV interconnection, PEA approval obtained",
      totalCapacityKw: 3200,
      pvModuleCount: 5850,
      equipmentDetails: { inverter125kw: 20, inverter80kw: 6, inverter60kw: 2, inverter40kw: 0 },
      locationCoordinates: { latitude: 13.3611, longitude: 101.0053 },
      ftsValue: 9800000,
      revenueValue: 47500000,
      pqmValue: 2400000,
    },
  },
  {
    status: "InProgress",
    payload: {
      projectName: "Solar Carport - Rayong Logistics Hub",
      address: "Map Ta Phut Industrial Port, Rayong 21150",
      clientInfo: "Eastern Seaboard Logistics PCL",
      startDate: "2026-04-01T00:00:00Z",
      estimatedEndDate: "2026-10-20T00:00:00Z",
      projectManagerId: managerId,
      team: "Delta Structural Crew",
      connectionType: "LV",
      connectionNotes: "400V LV tie-in to existing distribution board",
      totalCapacityKw: 780,
      pvModuleCount: 1420,
      equipmentDetails: { inverter125kw: 4, inverter80kw: 3, inverter60kw: 1, inverter40kw: 2 },
      locationCoordinates: { latitude: 12.6807, longitude: 101.1439 },
      ftsValue: 2600000,
      revenueValue: 11800000,
      pqmValue: 610000,
    },
  },
  {
    status: "Completed",
    payload: {
      projectName: "Solar Rooftop - Chiang Mai Cold Storage",
      address: "129 Superhighway Rd, Mueang Chiang Mai, Chiang Mai 50000",
      clientInfo: "Lanna Fresh Foods Co., Ltd.",
      startDate: "2025-06-01T00:00:00Z",
      estimatedEndDate: "2025-12-15T00:00:00Z",
      projectManagerId: managerId,
      team: "Alpha Installation Crew",
      connectionType: "MV",
      connectionNotes: "Commissioned and handed over, PPA active",
      totalCapacityKw: 950,
      pvModuleCount: 1730,
      equipmentDetails: { inverter125kw: 6, inverter80kw: 2, inverter60kw: 0, inverter40kw: 1 },
      locationCoordinates: { latitude: 18.7883, longitude: 98.9853 },
      ftsValue: 3100000,
      revenueValue: 14200000,
      pqmValue: 720000,
    },
  },
  {
    status: "OnHold",
    payload: {
      projectName: "Solar Farm - Kanchanaburi Ground Mount",
      address: "Tha Muang District, Kanchanaburi 71110",
      clientInfo: "Western Power Development Ltd.",
      startDate: "2026-05-20T00:00:00Z",
      estimatedEndDate: "2027-03-30T00:00:00Z",
      projectManagerId: managerId,
      team: "Bravo Field Crew",
      connectionType: "HV",
      connectionNotes: "On hold pending land-use permit renewal",
      totalCapacityKw: 5600,
      pvModuleCount: 10200,
      equipmentDetails: { inverter125kw: 32, inverter80kw: 8, inverter60kw: 4, inverter40kw: 0 },
      locationCoordinates: { latitude: 13.9836, longitude: 99.6414 },
      ftsValue: 15400000,
      revenueValue: 82000000,
      pqmValue: 4100000,
    },
  },
  {
    status: "Planning",
    payload: {
      projectName: "Solar Rooftop - Hat Yai Retail Complex",
      address: "1 Kanjanavanit Rd, Hat Yai, Songkhla 90110",
      clientInfo: "Southern Retail Group PCL",
      startDate: "2026-09-01T00:00:00Z",
      estimatedEndDate: "2027-02-28T00:00:00Z",
      projectManagerId: managerId,
      team: "Echo Survey Team",
      connectionType: "MV",
      connectionNotes: "Design phase, structural load survey in progress",
      totalCapacityKw: 1450,
      pvModuleCount: 2640,
      equipmentDetails: { inverter125kw: 9, inverter80kw: 3, inverter60kw: 2, inverter40kw: 1 },
      locationCoordinates: { latitude: 7.0086, longitude: 100.4747 },
      ftsValue: 4700000,
      revenueValue: 21300000,
      pqmValue: 1080000,
    },
  },
];

async function fetchAllProjects(token) {
  const res = await api("/api/v1/projects?pageSize=100", { token });
  return res.data?.items ?? [];
}

function printProjects(projects) {
  console.log(`\n📊 ${projects.length} project(s) in the API:\n`);
  for (const p of projects) {
    const kw = p.totalCapacityKw ?? 0;
    const eq = p.equipmentDetails ?? {};
    const inverters =
      (eq.inverter125kw ?? 0) + (eq.inverter80kw ?? 0) + (eq.inverter60kw ?? 0) + (eq.inverter40kw ?? 0);
    console.log(`  • ${p.projectName}`);
    console.log(`    ${p.projectId}  status=${p.status}  ${kw} kW  ${p.pvModuleCount ?? 0} modules  ${inverters} inverters`);
    console.log(`    ${p.address}`);
  }

  const totalKw = projects.reduce((sum, p) => sum + (p.totalCapacityKw ?? 0), 0);
  const byStatus = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`\n  Total capacity: ${totalKw.toLocaleString()} kW`);
  console.log(`  By status: ${JSON.stringify(byStatus)}\n`);
}

async function main() {
  console.log(`🌐 API: ${BASE_URL}`);
  const { token, userId } = await login();

  if (listOnly) {
    printProjects(await fetchAllProjects(token));
    return;
  }

  const existing = await fetchAllProjects(token);
  const existingNames = new Set(existing.map((p) => p.projectName));
  console.log(`📋 ${existing.length} project(s) already present`);

  for (const { payload, status } of seedProjects(userId)) {
    if (existingNames.has(payload.projectName)) {
      console.log(`⏭️  Skipping "${payload.projectName}" (already exists)`);
      continue;
    }

    const created = await api("/api/v1/projects", { method: "POST", body: payload, token });
    const { projectId } = created.data;
    console.log(`✅ Created "${payload.projectName}" (${projectId})`);

    // Creation always yields "Planning"; PATCH the project to set the real status.
    // Note: PATCH /projects/{id}/status returns 405 on this API — patch the project itself.
    if (status !== "Planning") {
      await api(`/api/v1/projects/${projectId}`, { method: "PATCH", body: { status }, token });
      console.log(`   ↳ status set to ${status}`);
    }
  }

  printProjects(await fetchAllProjects(token));
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
