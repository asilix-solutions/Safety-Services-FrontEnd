import { Report } from "@/types/report";

export const MOCK_REPORTS: Report[] = [
  {
    id: "REP-TSR-2026-0001",
    reportNumber: "REP-TSR-2026-0001",
    tenantId: "COMP-001",
    clientId: "c-101",
    projectId: "PRJ-001",
    jobNumber: "JOB-998822",
    reportType: "technical_safety",
    status: "APPROVED",
    title: "reports:mock.alhamra.title",
    authorId: "USR-004",
    authorName: "Eng. Faisal Khalid",
    sourceDomain: "engineering",
    sourceId: "EVAL-101",
    summary: "reports:mock.alhamra.summary",
    contentSnapshot: JSON.stringify({
      generalInfo: {
        facilityName: "reports:mock.alhamra.facility",
        locationDetails: "reports:mock.alhamra.location",
        scopeOfWork: "reports:mock.alhamra.scope"
      },
      observations: [
        "reports:mock.alhamra.obs1",
        "reports:mock.alhamra.obs2"
      ],
      findings: [
        "reports:mock.alhamra.find1"
      ],
      recommendations: [
        "reports:mock.alhamra.rec1"
      ]
    }),
    timeline: [
      {
        id: "evt-1",
        action: "created",
        performedBy: "Eng. Faisal Khalid",
        performedAt: "2026-06-10T08:00:00Z",
        notes: "reports:mock.alhamra.evt1"
      },
      {
        id: "evt-2",
        action: "submitted",
        performedBy: "Eng. Faisal Khalid",
        performedAt: "2026-06-10T10:30:00Z",
        notes: "reports:mock.alhamra.evt2"
      },
      {
        id: "evt-3",
        action: "approved",
        performedBy: "Admin Tariq",
        performedAt: "2026-06-11T14:00:00Z",
        notes: "reports:mock.alhamra.evt3"
      }
    ],
    createdAt: "2026-06-10T08:00:00Z",
    updatedAt: "2026-06-11T14:00:00Z"
  },
  {
    id: "REP-INS-2026-0002",
    reportNumber: "REP-INS-2026-0002",
    tenantId: "COMP-001",
    clientId: "c-102",
    projectId: "PRJ-002",
    siteVisitId: "SV-101",
    reportType: "site_inspection",
    status: "SUBMITTED",
    title: "reports:mock.skyline.title",
    authorId: "USR-006",
    authorName: "Eng. Tariq Al-Mansoor",
    sourceDomain: "site-visits",
    sourceId: "SV-101",
    summary: "reports:mock.skyline.summary",
    contentSnapshot: JSON.stringify({
      generalInfo: {
        facilityName: "reports:mock.skyline.facility",
        locationDetails: "reports:mock.skyline.location",
        scopeOfWork: "reports:mock.skyline.scope"
      },
      observations: [
        "reports:mock.skyline.obs1",
        "reports:mock.skyline.obs2"
      ],
      findings: [
        "reports:mock.skyline.find1"
      ],
      recommendations: [
        "reports:mock.skyline.rec1"
      ]
    }),
    timeline: [
      {
        id: "evt-4",
        action: "created",
        performedBy: "Eng. Tariq Al-Mansoor",
        performedAt: "2026-06-15T09:00:00Z",
        notes: "reports:mock.skyline.evt1"
      },
      {
        id: "evt-5",
        action: "submitted",
        performedBy: "Eng. Tariq Al-Mansoor",
        performedAt: "2026-06-15T11:45:00Z",
        notes: "reports:mock.skyline.evt2"
      }
    ],
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-06-15T11:45:00Z"
  },
  {
    id: "REP-PRG-2026-0003",
    reportNumber: "REP-PRG-2026-0003",
    tenantId: "COMP-001",
    clientId: "c-103",
    projectId: "PRJ-003",
    reportType: "project_progress",
    status: "DRAFT",
    title: "reports:mock.kingdom.title",
    authorId: "USR-003",
    authorName: "Eng. Sarah Ahmed",
    sourceDomain: "projects",
    sourceId: "PRJ-003",
    summary: "reports:mock.kingdom.summary",
    contentSnapshot: JSON.stringify({
      generalInfo: {
        facilityName: "reports:mock.kingdom.facility",
        locationDetails: "reports:mock.kingdom.location",
        scopeOfWork: "reports:mock.kingdom.scope"
      },
      observations: [
        "reports:mock.kingdom.obs1",
        "reports:mock.kingdom.obs2"
      ],
      findings: [
        "reports:mock.kingdom.find1"
      ],
      recommendations: [
        "reports:mock.kingdom.rec1"
      ]
    }),
    timeline: [
      {
        id: "evt-6",
        action: "created",
        performedBy: "Eng. Sarah Ahmed",
        performedAt: "2026-06-20T14:30:00Z",
        notes: "reports:mock.kingdom.evt1"
      }
    ],
    createdAt: "2026-06-20T14:30:00Z",
    updatedAt: "2026-06-20T14:30:00Z"
  },
  {
    id: "rep-901",
    reportNumber: "REP-TSR-2026-901",
    title: "reports:mock.vertex.title",
    tenantId: "COMP-001",
    clientId: "c-101",
    projectId: "PROJ-5512",
    reportType: "technical_safety",
    status: "APPROVED",
    authorName: "Dr. Marcus Vance",
    authorId: "u-3",
    sourceDomain: "engineering",
    sourceId: "PROJ-5512",
    summary: "reports:mock.vertex.summary",
    contentSnapshot: JSON.stringify({
      generalInfo: {
        facilityName: "reports:mock.vertex.facility",
        locationDetails: "reports:mock.vertex.location"
      },
      observations: ["reports:mock.vertex.obs1"],
      findings: ["reports:mock.vertex.find1"],
      recommendations: ["reports:mock.vertex.rec1"]
    }),
    timeline: [
      { id: "e1", action: "created", performedBy: "Dr. Marcus Vance", performedAt: "2026-05-25T14:00:00Z" }
    ],
    createdAt: "2026-05-25T14:00:00Z",
    updatedAt: "2026-05-28T16:00:00Z",
  },
  {
    id: "rep-902",
    reportNumber: "REP-INS-2026-902",
    title: "reports:mock.skylinesprinkler.title",
    tenantId: "COMP-001",
    clientId: "c-102",
    projectId: "PROJ-8821",
    reportType: "site_inspection",
    status: "APPROVED",
    authorName: "Elena Rostova",
    authorId: "u-4",
    sourceDomain: "site-visits",
    sourceId: "PROJ-8821",
    summary: "reports:mock.skylinesprinkler.summary",
    contentSnapshot: JSON.stringify({
      generalInfo: {
        facilityName: "reports:mock.skylinesprinkler.facility",
        locationDetails: "reports:mock.skylinesprinkler.location"
      },
      observations: ["reports:mock.skylinesprinkler.obs1"],
      findings: ["reports:mock.skylinesprinkler.find1"],
      recommendations: ["reports:mock.skylinesprinkler.rec1"]
    }),
    timeline: [
      { id: "e2", action: "created", performedBy: "Elena Rostova", performedAt: "2026-05-30T10:00:00Z" }
    ],
    createdAt: "2026-05-30T10:00:00Z",
    updatedAt: "2026-06-01T14:30:00Z",
  },
  {
    id: "rep-903",
    reportNumber: "REP-TSR-2026-903",
    title: "reports:mock.gulf.title",
    tenantId: "COMP-001",
    clientId: "c-103",
    projectId: "PROJ-7643",
    reportType: "technical_safety",
    status: "SUBMITTED",
    authorName: "Dr. Marcus Vance",
    authorId: "u-3",
    sourceDomain: "engineering",
    sourceId: "PROJ-7643",
    summary: "reports:mock.gulf.summary",
    contentSnapshot: JSON.stringify({
      generalInfo: {
        facilityName: "reports:mock.gulf.facility",
        locationDetails: "reports:mock.gulf.location"
      },
      observations: ["reports:mock.gulf.obs1"],
      findings: ["reports:mock.gulf.find1"],
      recommendations: ["reports:mock.gulf.rec1"]
    }),
    timeline: [
      { id: "e3", action: "created", performedBy: "Dr. Marcus Vance", performedAt: "2026-06-03T11:00:00Z" }
    ],
    createdAt: "2026-06-03T11:00:00Z",
    updatedAt: "2026-06-03T11:20:00Z",
  },
];
