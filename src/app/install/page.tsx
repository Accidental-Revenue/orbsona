import type { Metadata } from "next";
import { PackageGuide } from "@/components/package/package-guide";

export const metadata: Metadata = {
  title: "Install",
  description: "Install the Orbsona React renderer and add a living identity to your AI agent.",
  alternates: {
    canonical: "/install",
  },
};

export default function InstallPage() {
  return <PackageGuide />;
}
