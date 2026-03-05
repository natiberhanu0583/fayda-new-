import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Account",
    description:
        "Register for a Fayda account to access the Ethiopian national ID card extraction and generation platform. Sign up with your email and phone number.",
    robots: { index: false, follow: false },
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
