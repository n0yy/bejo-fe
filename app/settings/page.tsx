import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserById } from "@/lib/firebase/user";
import Navbar from "@/components/Navbar";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const user = await getUserById(session.user.id);

  if (!user || user.status !== "approved") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return (
    <>
      <Navbar />
      <div className="pt-20 w-4/12 mx-auto pb-10">
        <header className="mb-5">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-gray-600">
            Kelola data dan kredensial database Anda
          </p>
        </header>

        {/* Gunakan Client Component untuk form */}
        <SettingsForm initialUser={user} />
      </div>
    </>
  );
}
