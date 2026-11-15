import type { Metadata } from "next";
import { Placeholder, TextPage } from "@/components/text-page";

export const metadata: Metadata = { title: "Impressum" };

export default function Page() {
  return (
    <TextPage title="Impressum">
      <Placeholder what="Impressum" />
    </TextPage>
  );
}
