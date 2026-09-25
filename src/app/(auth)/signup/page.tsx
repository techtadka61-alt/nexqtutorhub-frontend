import { redirect } from "next/navigation";

/** Signup lives on one page per role; keeps old `/signup?role=...` links working. */
export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { role } = await searchParams;
  redirect(role === "tutor" ? "/signup/tutor" : "/signup/student");
}
