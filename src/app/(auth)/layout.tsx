import { Navbar } from "@/components/layout/Navbar";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
    </>
  );
}
