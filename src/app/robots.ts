import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    return {
        rules: [
            {
                userAgent: "*",
                disallow: ["/", "/api/"], // Block all crawlers from private authenticated app
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
