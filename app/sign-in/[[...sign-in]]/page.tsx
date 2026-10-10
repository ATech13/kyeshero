import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;

  if (userId) {
    redirect(params?.redirect_url || "/admin");
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-12 px-4">
      <SignIn
        fallbackRedirectUrl="/admin"
        forceRedirectUrl={params?.redirect_url || "/admin"}
      />
    </div>
  );
}