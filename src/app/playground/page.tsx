import type { Metadata } from "next";
import { RuntimePlayground } from "@/components/playground/runtime-playground";

export const metadata: Metadata = {
  title: "Playground",
  description: "Preview how an Orbsona identity responds to agent state and signal energy.",
  alternates: {
    canonical: "/playground",
  },
};

export default function PlaygroundPage() {
  return <RuntimePlayground />;
}
