import Image from "next/image";
import { Dashboard } from "@/components/dashboard";
export default function Home() {
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Dashboard />
    </div>
  );
}
