import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import HomePage from "@/components/HomePage";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect;
    /*redirect("/dashboard");*/
  }

  return <HomePage />;
}
