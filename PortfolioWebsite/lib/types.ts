export type Education = { institution: string; degree: string; field: string; startYear: string; endYear: string; description?: string };
export type Job = { company: string; position: string; description: string; startDate: string; endDate: string };
export type Profile = { name: string; headshotImage: string; biography: string; tagline?: string; bannerImage?: string; education: Education[]; tools: string[]; jobs: Job[] };
export type Project = { id: string; title: string; thumbnail: string; images: string[]; imageDescriptions?: Record<string, string>; featured?: boolean; date: string; description: string; technologies: string[]; link: string; slug: string };
