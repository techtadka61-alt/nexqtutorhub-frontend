import type { Metadata } from "next";
import { bodyFont, displayFont, scriptFont } from "@/lib/fonts";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NexTutorHub — Find the Right Tutor Near You",
    template: "%s | NexTutorHub",
  },
  description:
    "NexTutorHub is a local home-tuition marketplace connecting students and parents with verified tutors, matched by subject, class, area, schedule and budget.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} ${scriptFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-text-primary">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
