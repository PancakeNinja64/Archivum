import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of Archivum’s catalog and accounts.",
};

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Service" updated="August 7, 2026">
      <LegalSection title="1. Agreement">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern access to and use of the Archivum
          website, catalog, and related services (the &ldquo;Service&rdquo;) operated by
          Archivum LLC (&ldquo;Archivum,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;). By creating
          an account, accessing the Service, or clicking to accept these Terms, you agree to be
          bound by them and by our{" "}
          <Link href="/privacy/" className="link-underline text-accent-strong dark:text-accent">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/disclaimer/" className="link-underline text-accent-strong dark:text-accent">
            Disclaimer
          </Link>
          . If you do not agree, do not use the Service.
        </p>
      </LegalSection>

      <LegalSection title="2. What Archivum is">
        <p>
          Archivum is a <strong className="font-medium text-foreground">metadata catalog</strong> of
          publicly described AI datasets. We index information that publishers and platforms make
          available (for example names, descriptions, licence fields, and documentation signals).
          We do <strong className="font-medium text-foreground">not</strong> host, store, or
          redistribute dataset files. Downloads and use of underlying data happen at the origin,
          under that origin&rsquo;s terms.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts">
        <p>
          You must provide a valid email and keep your credentials confidential. You are
          responsible for activity under your account. We may suspend or terminate accounts that
          violate these Terms, abuse the Service, or create risk for Archivum or other users.
        </p>
        <p>
          Free accounts may save a limited number of datasets and receive change signals about
          those records. Features and limits may change as the product evolves.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Scrape, overload, or interfere with the Service in a way that harms availability</li>
          <li>Attempt to access non-public systems, other users&rsquo; data, or admin areas without authorization</li>
          <li>Misrepresent Archivum records as legal advice, certification, or a licence grant</li>
          <li>Use the Service to violate law, third-party rights, or source-platform terms</li>
          <li>Submit knowingly false correction reports or spam through public channels</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Your responsibility for datasets and licences">
        <p>
          Licence labels, commercial-use fields, and Documentation Coverage on Archivum are
          <strong className="font-medium text-foreground"> reports of what we observed at the source</strong>,
          not permissions to use data and not legal conclusions. Before you train models, redistribute
          data, or rely on a licence commercially, you must review the licence and terms at the
          origin yourself (and obtain counsel if needed). You are solely responsible for compliance
          with all applicable licences, privacy laws, and third-party rights.
        </p>
      </LegalSection>

      <LegalSection title="6. Intellectual property">
        <p>
          Archivum&rsquo;s branding, site design, software, and original editorial content are owned
          by Archivum LLC or its licensors. Dataset names, descriptions, and other third-party
          content remain with their respective owners. You may link to public Archivum pages; you
          may not copy the Service wholesale or remove attribution.
        </p>
      </LegalSection>

      <LegalSection title="7. Corrections and feedback">
        <p>
          We welcome factual corrections about catalog records. Submitting a correction does not
          create an obligation to publish, respond, or change a record within any timeframe. See
          the corrections section in our{" "}
          <Link href="/docs/#corrections" className="link-underline text-accent-strong dark:text-accent">
            documentation
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimers">
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE.&rdquo; TO THE
          MAXIMUM EXTENT PERMITTED BY LAW, ARCHIVUM DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS,
          IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
          NON-INFRINGEMENT. We do not warrant that records are complete, current, or error-free, or
          that Documentation Coverage predicts model safety, data quality, or legal compliance.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, ARCHIVUM LLC AND ITS OFFICERS, DIRECTORS,
          EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR
          BUSINESS OPPORTUNITY, ARISING FROM YOUR USE OF THE SERVICE OR RELIANCE ON ANY CATALOG
          RECORD. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE
          GREATER OF (A) THE AMOUNTS YOU PAID US FOR THE SERVICE IN THE TWELVE MONTHS BEFORE THE
          CLAIM OR (B) ONE HUNDRED U.S. DOLLARS (US&nbsp;$100).
        </p>
      </LegalSection>

      <LegalSection title="10. Indemnity">
        <p>
          You agree to defend and indemnify Archivum LLC against claims, damages, and expenses
          (including reasonable attorneys&rsquo; fees) arising from your misuse of the Service,
          your use of third-party datasets, or your violation of these Terms or applicable law.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes">
        <p>
          We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date will
          change when we do. Continued use after changes become effective constitutes acceptance.
          Material changes may also be noted in the product or by email when practical.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Questions about these Terms:{" "}
          <a href="mailto:archivumllc@gmail.com" className="link-underline text-accent-strong dark:text-accent">
            archivumllc@gmail.com
          </a>
          .
        </p>
        <p className="text-sm">
          These Terms are a practical baseline for an early-stage product. They are not a substitute
          for advice from a lawyer licensed in your jurisdiction.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
