import type { Metadata } from "next";
import { Placeholder, TextPage } from "@/components/text-page";

export const metadata: Metadata = { title: "Widerrufsbelehrung" };

export default function Page() {
  return (
    <TextPage title="Widerrufsbelehrung">
      <Placeholder what="Widerrufsbelehrung inkl. Muster-Widerrufsformular" />
    </TextPage>
  );
}
