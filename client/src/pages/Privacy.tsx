import React from 'react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Privacy Policy for TheOxus.com</h1>
        <Link href="/" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md">
          Back to Home
        </Link>
      </div>
      <div className="text-sm text-gray-500 mb-8">
        <p><strong>Effective Date:</strong> June 1, 2025</p>
        <p><strong>Published:</strong> May 30, 2025</p>
      </div>
      
      <section className="mb-8">
        <p className="mb-4 leading-relaxed">
          TheOxus.com, a Pennsylvania-based news aggregation platform operated by Kian Erfaan Jamasbi, JD, adheres to the ACM Code of Ethics (2018), prioritizing privacy, fairness, and security. Using Replit for prototyping, GitHub for version control, and Firebase for Google SSO, we collect minimal data starting June 1, 2025: Google Sign-In email, User UID, and usage data (IP, browser, device, etc.), retained for 12 months then anonymized. Premium subscriptions ($2.99/month) use Stripe for payments; preferences are stored in Firebase, secured for 30 days post-deletion. Data is used for authentication, premium features, and performance analysis, shared only with Google, Stripe, or as legally required, with international transfers compliant with GDPR.
        </p>
        
        <p className="mb-4 leading-relaxed">
          Data security is ensured via HTTPS, Firebase Security Rules, and regular audits, aligning with ACM standards (2.9). Users can access/update preferences in-App, request deletion via kianerfaan@proton.me (processed within 30 days), or opt out by not signing in. Disputes are resolved through binding arbitration in Pennsylvania under AAA rules, with opt-out available within 30 days. Governed by Pennsylvania law, policy updates are communicated 30 days in advance via email or App. For questions, contact kianerfaan@proton.me.
        </p>
      </section>
    </div>
  );
}