// src/constants/categories.js

export const CATEGORIES = [
    { name: "General", slug: "general" },
    { name: "Questions", slug: "questions" },
    { name: "Discussions", slug: "discussions" },
    { name: "Announcements", slug: "announcements" },
    { name: "Help", slug: "help" },
];

// Helper object to quickly find category name by slug
export const bySlug = CATEGORIES.reduce((acc, cat) => {
    acc[cat.slug] = cat.name;
    return acc;
}, {});
