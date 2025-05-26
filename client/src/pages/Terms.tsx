import React from 'react';
import { Link } from 'wouter';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Terms of Service for theOxus.com</h1>
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
          TheOxus.com, a news aggregation platform, is operated in Pennsylvania, United States, as a sole proprietorship by Kian Erfaan Jamasbi, JD. These Terms of Service ("Terms") govern your use of our web application ("App") and are separate from our Privacy Policy. By accessing the App, you agree to comply with these Terms, which are governed by Pennsylvania common law. If you do not agree, please do not use the App.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
        <p className="mb-4">
          The App provides access to news, calendars, libraries, and related features, sourced from third parties, at no cost, with premium features available starting July 1, 2025. Premium features require a Google account sign-in and a subscription of $2.99 per month (USD, EUR, CAD, or GBP, inclusive of taxes and fees), processed securely by Stripe. TheOxus.com reserves the right to modify or discontinue the App or its features at any time, with notice provided as feasible.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
        <p className="mb-4">
          You agree to use the App lawfully and in accordance with these Terms. You shall not reproduce, distribute, or modify third-party content without authorization, engage in activities that disrupt or harm the App's functionality, or access premium features without a valid subscription.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Third-Party Content</h2>
        <p className="mb-4">
          The App aggregates content from third-party sources, such as news outlets and Wikipedia. TheOxus.com does not control, endorse, or guarantee the accuracy, legality, or availability of such content. Your interaction with third-party content is at your own risk.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
        <p className="mb-4">
          The App's design and structure are the property of TheOxus.com. Third-party content remains the property of its respective owners, subject to their licensing terms. Your use of the App must respect these intellectual property rights.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Premium Subscriptions</h2>
        <p className="mb-4">
          Premium subscriptions are billed monthly through Stripe. You may cancel your subscription at any time via your account settings, and no further charges will apply after cancellation. Refunds, if applicable, are subject to Stripe's policies and TheOxus.com's discretion, in compliance with applicable law.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
        <p className="mb-4">
          Significant changes to these Terms, including the introduction of new features planned for July 1, 2025, will be communicated with at least 30 days' notice via email or within the App. TheOxus.com will strive to keep users informed of any updates.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
        <p className="mb-4">
          To the fullest extent permitted by Pennsylvania common law, TheOxus.com is not liable for damages arising from your use of the App, including those related to third-party content, service interruptions, or data loss. You acknowledge that use of the App is at your own risk.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Dispute Resolution</h2>
        <p className="mb-4">
          Any disputes arising from these Terms or your use of the App will be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules. Arbitration will occur in Pennsylvania, United States, and be conducted in English.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
        <p className="mb-4">
          These Terms are governed by the common law of Pennsylvania, United States, without regard to conflict of law principles.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          For questions regarding these Terms, please contact TheOxus.com at kianerfaan@proton.me.
        </p>
      </section>
    </div>
  );
}