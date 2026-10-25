import { RequireAuth } from "@/core/auth/guards";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth admin>{children}</RequireAuth>;
}
