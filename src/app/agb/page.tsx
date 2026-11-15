import type { Metadata } from "next";
import { Placeholder, TextPage } from "@/components/text-page";

export const metadata: Metadata = { title: "Allgemeine Geschäftsbedingungen" };

export default function Page() {
  return (
    <TextPage title="Allgemeine Geschäftsbedingungen">
      <Placeholder what="AGB" />
    </TextPage>
  );
}
