import type { Metadata } from "next";
import { TextPage } from "@/components/text-page";

export const metadata: Metadata = {
  title: "Pflege & Anwendung",
  description: "So verwendest und pflegst du deine Kupferflasche, Kupferbecher und deinen Zungenreiniger aus Kupfer.",
};

export default function Page() {
  return (
    <TextPage title="Pflege & Anwendung">
      <p>
        Kupfer ist ein lebendiges Material. Mit der richtigen Pflege begleiten dich deine Kupferprodukte viele Jahre – und
        entwickeln dabei ihren ganz eigenen Charakter.
      </p>

      <h2>Vor der ersten Benutzung</h2>
      <p>Spüle Flasche und Becher gründlich mit warmem Wasser aus und lass sie offen trocknen.</p>

      <h2>So verwendest du deine Kupferflasche</h2>
      <ul>
        <li>Fülle die Flasche am Abend mit stillem Wasser und lass sie über Nacht stehen.</li>
        <li>Verwende nur stilles Wasser. Säurehaltige Getränke (Saft, Zitronenwasser, Tee mit Zitrone), Milch und kohlensäurehaltige Getränke gehören nicht in Kupfergefäße.</li>
        <li>Kupfergefäße sind nicht für Säuglinge und Kleinkinder bestimmt.</li>
        <li>Nicht für heiße Getränke, nicht in die Mikrowelle und nicht in den Gefrierschrank.</li>
      </ul>

      <h2>Reinigung</h2>
      <ul>
        <li>Nicht spülmaschinengeeignet – bitte nur von Hand mit warmem Wasser reinigen.</li>
        <li>Nach dem Spülen gut abtropfen und mit geöffnetem Deckel trocknen lassen.</li>
        <li>Keine Scheuermittel oder Stahlwolle verwenden.</li>
      </ul>

      <h2>Warum wird Kupfer dunkel?</h2>
      <p>
        Kupfer reagiert mit Luft und Wasser und bildet mit der Zeit eine dunkle Schicht (Patina). Das ist ein natürlicher
        Vorgang und kein Mangel.
      </p>
      <p>
        <strong>Zum Aufpolieren:</strong> Eine halbe Zitrone in Salz tauchen und die Oberfläche damit abreiben – oder eine
        Paste aus Essig, Salz und etwas Mehl verwenden. Danach gründlich mit klarem Wasser nachspülen und abtrocknen.
      </p>

      <h2>Zungenreiniger</h2>
      <ul>
        <li>Morgens vor dem Zähneputzen den Zungenreiniger mit beiden Händen an den Enden halten.</li>
        <li>Sanft von hinten nach vorne über die Zunge ziehen, 3–5 Mal wiederholen und zwischendurch abspülen.</li>
        <li>Nach der Anwendung abspülen und trocken aufbewahren.</li>
      </ul>
    </TextPage>
  );
}
