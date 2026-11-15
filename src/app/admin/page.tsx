import { isAdmin } from "@/lib/auth";
import { AdminPanel } from "@/components/admin-panel";
import { AdminLogin } from "@/components/admin-login";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin/>;
  return <AdminPanel/>;
}
