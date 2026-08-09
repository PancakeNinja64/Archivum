import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, LegalSection } from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Archivum collects and uses account and usage information.",
};

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy" updated="August 7, 2026">
      <LegalSection title="1. Scope">
        <p>
          This Privacy Policy explains how Archivum LLC (&ldquo;Archivum,&rdquo; &ldquo;we,&rdquo;
          or &ldquo;us&rdquo;) handles information when you use the Archivum website and services
          (the &ldquo;Service&rdquo;). It should be read with our{" "}
          <Link href="/terms/" className="link-underline text-accent-strong dark:text-accent">
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>
          <strong className="font-medium text-foreground">Account data.</strong> When you sign up
          we collect the email address and password you provide. Passwords are handled by our
          authentication provider (Supabase) using industry-standard hashing; we do not store
          plaintext passwords.
        </p>
        <p>
          <strong className="font-medium text-foreground">Product data.</strong> If you save
          datasets or use the dashboard, we store which catalog records you saved and related
          activity needed to show your watchlist.
        </p>
        <p>
          <strong className="font-medium text-foreground">Corrections.</strong> If you submit a
          correction, we may store the message, optional email, dataset slug, and basic
          anti-abuse signals (such as approximate rate-limit keys).
        </p>
        <p>
          <strong className="font-medium text-foreground">Technical data.</strong> Our hosting and
          infrastructure providers may process standard server logs (IP address, user agent,
          timestamps) to operate and secure the Service.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <ul className="list-disc space-y-2 pl-5">
          <li>To create and secure your account, and to reset passwords</li>
          <li>To provide saved datasets, dashboard features, and admin tooling for authorized operators</li>
          <li>To improve reliability, prevent abuse, and debug issues</li>
          <li>To communicate about the Service when necessary (for example security or account notices)</li>
        </ul>
        <p>
          We do not sell your personal information. We do not use your email for third-party
          advertising.
        </p>
      </LegalSection>

      <LegalSection title="4. Processors">
        <p>
          We use service providers to run the Service, including hosting (for example Vercel) and
          authentication/database infrastructure (for example Supabase). They process data on our
          instructions to provide those services.
        </p>
      </LegalSection>

      <LegalSection title="5. Retention">
        <p>
          We keep account and saved-dataset data while your account is active. You may request
          deletion by emailing us. We may retain limited records as required for security, dispute
          resolution, or legal compliance.
        </p>
      </LegalSection>

      <LegalSection title="6. Your choices">
        <p>
          You can update your password via the reset flow, stop using the Service, or contact us to
          request access or deletion of account data associated with your email. Catalog pages that
          do not require an account can be browsed without signing up.
        </p>
      </LegalSection>

      <LegalSection title="7. Children">
        <p>
          The Service is not directed to children under 13, and we do not knowingly collect
          personal information from them.
        </p>
      </LegalSection>

      <LegalSection title="8. International users">
        <p>
          The Service may be hosted in the United States. If you access it from elsewhere, you
          consent to processing in the U.S. and other locations where our providers operate.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          We may update this Policy from time to time. The &ldquo;Last updated&rdquo; date will
          change when we do.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Privacy requests:{" "}
          <a href="mailto:business@archivum.tech" className="link-underline text-accent-strong dark:text-accent">
            business@archivum.tech
          </a>
          .
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
