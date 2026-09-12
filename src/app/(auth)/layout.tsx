import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2 font-bold">
        <span className="text-2xl">🗒️</span>
        <span className="pop-heading text-xl">{APP_NAME}</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
