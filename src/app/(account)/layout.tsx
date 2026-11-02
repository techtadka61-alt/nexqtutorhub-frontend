import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/account/ProtectedRoute";
import { AccountShell } from "@/components/account/AccountShell";

// Signed-in dashboards: nothing for search engines. Not blocked in robots.txt, so Google can fetch the page and see this.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: LayoutProps<"/">) {
  return (
    <ProtectedRoute>
      <AccountShell>{children}</AccountShell>
    </ProtectedRoute>
  );
}
