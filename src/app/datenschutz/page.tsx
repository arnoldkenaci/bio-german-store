import type { Metadata } from "next";
import { Placeholder, TextPage } from "@/components/text-page";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default function Page() {
  return (
    <TextPage title="Datenschutzerklärung">
      <Placeholder what="Datenschutzerklärung" />
    </TextPage>
  );
}
