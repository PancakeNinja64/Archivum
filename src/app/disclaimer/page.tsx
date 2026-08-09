import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Archivum indexes public dataset metadata. Not legal advice; not a licence; not a quality or safety score.",
};

export default function DisclaimerPage() {
  return (
    <LegalDoc title="Disclaimer" updated="August 7, 2026">
      <LegalSection title="Not legal advice">
        <p>
          Nothing on Archivum — including licence fields, commercial-use labels, Documentation
          Coverage, lineage graphs, or commentary — is legal advice. Archivum LLC is not your
          lawyer. Decisions about training, redistribution, commercial use, privacy, or compliance
          are yours alone. Consult qualified counsel when needed.
        </p>
      </LegalSection>

      <LegalSection title="Not a licence grant">
        <p>
          Archivum does not grant rights in any third-party dataset. Seeing a licence SPDX string
          or &ldquo;commercial use&rdquo; field in our catalog does not mean you may use the data
          that way. Always read and follow the licence and terms at the source platform or
          publisher.
        </p>
      </LegalSection>

      <LegalSection title="Metadata only; fair reporting of public records">
        <p>
          We index and summarize metadata and documentation signals that publishers and platforms
          make publicly available. We do not host dataset payloads. Our purpose is to help people
          understand what public sources already say about origin, licensing, and documentation —
          not to copy or replace those sources.
        </p>
      </LegalSection>

      <LegalSection title="Documentation Coverage is not a quality or safety score">
        <p>
          Documentation Coverage measures how much provenance-related information was documented at
          the source when we checked. It is not a measure of data quality, accuracy, bias, safety,
          fitness for a model, or legal cleanliness. A high score does not mean a dataset is safe
          to use; a low score does not mean it is unsafe.
        </p>
      </LegalSection>

      <LegalSection title="No warranty; records may be wrong or stale">
        <p>
          Sources change. Our crawls and checks can miss fields, lag behind updates, or mis-parse
          ambiguous text. Treat every record as a starting point for your own review. Use of the
          Service is at your own risk. See also our{" "}
          <Link href="/terms/" className="link-underline text-accent-strong dark:text-accent">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Third-party sites">
        <p>
          Links to Hugging Face, GitHub, and other origins are for convenience. Those sites have
          their own terms and privacy practices. Archivum is not responsible for third-party
          content or availability.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          <a href="mailto:business@archivum.tech" className="link-underline text-accent-strong dark:text-accent">
            business@archivum.tech
          </a>
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
