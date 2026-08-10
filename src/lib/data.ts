export interface Project {
  id: string;
  title: string;
  status: "Completed" | "Rendering" | "Scripting" | "Research" | "Draft";
  progress: number;
  updated: string;
  views: number;
  thumb: string;
}

export const projects: Project[] = [
  { id: "p1", title: "The Fall of Ancient Rome", status: "Completed", progress: 100, updated: "2026-08-08T10:20:00Z", views: 482000, thumb: "#1a5ff0" },
  { id: "p2", title: "How the Internet Was Built", status: "Rendering", progress: 64, updated: "2026-08-09T08:05:00Z", views: 0, thumb: "#02a5f0" },
  { id: "p3", title: "The Cold War Decoded", status: "Scripting", progress: 28, updated: "2026-08-09T09:40:00Z", views: 0, thumb: "#10b981" },
  { id: "p4", title: "Ocean Mysteries Untold", status: "Research", progress: 12, updated: "2026-08-07T16:30:00Z", views: 0, thumb: "#f59e0b" },
  { id: "p5", title: "The Economics of Empires", status: "Draft", progress: 5, updated: "2026-08-06T12:00:00Z", views: 0, thumb: "#ef4444" },
];

export interface Activity {
  id: string;
  type: string;
  message: string;
  time: string;
}

export const activities: Activity[] = [
  { id: "a1", type: "render", message: "Render completed for 'The Fall of Ancient Rome'", time: "2026-08-08T10:20:00Z" },
  { id: "a2", type: "script", message: "Script generated for 'The Cold War Decoded'", time: "2026-08-09T09:40:00Z" },
  { id: "a3", type: "research", message: "12 new trending ideas saved", time: "2026-08-09T08:00:00Z" },
  { id: "a4", type: "seo", message: "SEO score improved to 92 on 'Ocean Mysteries'", time: "2026-08-07T15:10:00Z" },
  { id: "a5", type: "upload", message: "Thumbnail uploaded to YouTube", time: "2026-08-06T11:45:00Z" },
];

export const analyticsViewsData = [
  { name: "Mon", views: 42000 },
  { name: "Tue", views: 61000 },
  { name: "Wed", views: 38000 },
  { name: "Thu", views: 78000 },
  { name: "Fri", views: 95000 },
  { name: "Sat", views: 128000 },
  { name: "Sun", views: 84000 },
];

export const audienceRetention = [
  { name: "0%", value: 100 },
  { name: "20%", value: 88 },
  { name: "40%", value: 71 },
  { name: "60%", value: 58 },
  { name: "80%", value: 44 },
  { name: "100%", value: 31 },
];

export const ctrData = [
  { name: "Mon", ctr: 5.2 },
  { name: "Tue", ctr: 6.1 },
  { name: "Wed", ctr: 4.8 },
  { name: "Thu", ctr: 7.4 },
  { name: "Fri", ctr: 8.9 },
  { name: "Sat", ctr: 9.3 },
  { name: "Sun", ctr: 7.1 },
];

export const topVideos = [
  { title: "The Fall of Ancient Rome", views: 482000, ctr: 8.4, watch: 412000 },
  { title: "Space Race: The Hidden War", views: 391000, ctr: 7.9, watch: 320000 },
  { title: "How Empires Collapse", views: 278000, ctr: 6.8, watch: 241000 },
  { title: "The Origins of Money", views: 198000, ctr: 5.4, watch: 167000 },
];

export const topicRecommendations = [
  "The secret history of the Spice Trade",
  "How algorithms rewired human memory",
  "The collapse of the Soviet space program",
  "Lost technologies of the ancient world",
];
