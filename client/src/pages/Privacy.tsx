import React from 'react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Privacy Policy for theOxus.com</h1>
        <Link href="/">
          <a className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md">
            Back to Home
          </a>
        </Link>
      </div>
      <div className="text-sm text-gray-500 mb-8">
        <p><strong>Effective Date:</strong> June 1, 2025</p>
        <p><strong>Published:</strong> May 26, 2025</p>
      </div>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">
          TheOxus.com, a news aggregation platform, is operated in Pennsylvania, United States, as a sole proprietorship by Kian Erfaan Jamasbi, JD. This Privacy Policy explains how we collect, use, share, and protect your information when you use our web application ("App"). This policy is distinct from our Terms of Service and is governed by Pennsylvania common law.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Information Collection</h2>
        <p className="mb-4">
          TheOxus.com collects information based on your interaction with the App. Starting July 1, 2025, if you choose to create an account and sign in with Google to access premium features, Firebase Authentication will collect your Google account email address, confirmation of Google as the authentication provider, account creation date, last sign-in date, and a randomized, anonymous User UID.
        </p>
        <p className="mb-4">
          For all users, TheOxus.com collects usage data, including IP addresses, browser type, device type, country, page visits (e.g., /api/news, /api/top-news), referrer URLs (e.g., t.co links), HTTP statuses, and request durations, to maintain and improve App performance.
        </p>
        <p className="mb-4">
          If you subscribe to premium features for $2.99 per month (USD, EUR, CAD, or GBP, inclusive of taxes and fees), Stripe, our payment processor, collects and processes payment details, such as credit card information. TheOxus.com does not store payment details. For signed-in users, privacy and subscription settings are stored in Firebase Firestore under your User UID.
        </p>

      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Information Use</h2>
        <p className="mb-4">
          Collected information is used to authenticate signed-in users, provide access to premium features, process subscription payments via Stripe, store user preferences, and analyze usage data to enhance App functionality.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
        <p className="mb-4">
          TheOxus.com shares information only as necessary. For signed-in users, Google facilitates authentication, subject to Google's Privacy Policy. For subscribers, Stripe processes payments, subject to Stripe's Privacy Policy. Information may be shared if required by law or to protect TheOxus.com's rights, but it is never sold or shared for marketing purposes.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Policy Updates</h2>
        <p className="mb-4">
          Significant updates to this Privacy Policy, including those related to the July 1, 2025, introduction of premium features, will be communicated with at least 30 days' notice via email or within the App.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
        <p className="mb-4">
          TheOxus.com employs industry-standard measures, such as HTTPS encryption and Firebase Security Rules, to protect your information. However, no platform can guarantee absolute security, and you use the App at your own risk.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
        <p className="mb-4">
          Signed-in users may access and update their account details and preferences within the App. To request data deletion, contact kianerfaan@proton.me, and TheOxus.com will comply within 30 days, subject to legal obligations. You may opt out of sign-in data collection by not creating an account or by deleting your account. Ceasing use of the App avoids usage data collection. TheOxus.com complies with GDPR, CCPA, and other applicable privacy laws.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>
        <p className="mb-4">
          Any disputes arising from this Privacy Policy or your use of the App will be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules. Arbitration will occur in Pennsylvania, United States, and be conducted in English.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
        <p className="mb-4">
          This Privacy Policy is governed by the common law of Pennsylvania, United States, without regard to conflict of law principles.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          For questions regarding this Privacy Policy, please contact TheOxus.com at kianerfaan@proton.me.
        </p>
      </section>
    </div>
  );
}