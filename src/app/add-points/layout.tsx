import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add Points",
    description: "Admin panel for adding user points on the Fayda platform.",
    robots: { index: false, follow: false },
};

export default function AddPointsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
