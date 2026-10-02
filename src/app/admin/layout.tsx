import { redirect } from "next/navigation";
import { getAdminAuthStatus } from "@/lib/admin-auth";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await getAdminAuthStatus();

  if (authResult.status === "UNAUTHENTICATED") {
    redirect("/login?callbackUrl=/admin");
  }

  if (authResult.status === "FORBIDDEN") {
    return <AdminAccessDenied user={authResult.user} />;
  }

  return <>{children}</>;
}
