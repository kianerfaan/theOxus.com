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
      <p className="text-sm text-gray-500 mb-8">Effective Date: May 14, 2025</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using theOxus.com ("App"), you agree to be bound by these Terms of Service ("Terms"). 
          If you do not agree with these Terms, you must not use the App.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
        <p className="mb-4">
          theOxus.com is a free, non-commercialized news aggregation platform that provides access to news feeds, 
          a calendar, a library, and other features. The App aggregates content from third-party sources and is 
          hosted on Replit's deployment services. We reserve the right to modify or discontinue the App or 
          its features at any time without notice.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
        <p className="mb-4">
          You agree to use the App solely for lawful purposes. You shall not:
        </p>
        <ul className="list-disc pl-8 mb-4 space-y-2">
          <li>Reproduce, distribute, or modify third-party content without authorization.</li>
          <li>Engage in any activity that disrupts or harms the App's functionality.</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Third-Party Content</h2>
        <p className="mb-4">
          The App aggregates content from third-party sources, such as news outlets and Wikipedia. 
          We do not control or endorse such content and are not responsible for its accuracy, legality, 
          or availability. Your use of third-party content is at your own risk.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
        <p className="mb-4">
          The App's design and structure are owned by theOxus.com. Third-party content remains the property 
          of its respective owners and is subject to their licensing terms.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Future Changes</h2>
        <p className="mb-4">
          theOxus.com is currently offered free of charge with no commercial intent. If we introduce paid 
          features or commercialize the App in the future, we will provide at least 30 days' notice and 
          update these Terms accordingly.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
        <p className="mb-4">
          To the fullest extent permitted by law, theOxus.com shall not be liable for any damages arising 
          from your use of the App, including but not limited to issues with third-party content, service 
          interruptions, or data loss.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Dispute Resolution</h2>
        <p className="mb-4">
          Any disputes arising from these Terms or your use of the App shall be resolved through binding 
          arbitration administered by the American Arbitration Association (AAA) under its Consumer 
          Arbitration Rules. Arbitration shall take place in Pennsylvania, United States, and proceedings 
          shall be conducted in English.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
        <p className="mb-4">
          These Terms are governed by the laws of the State of Pennsylvania, United States, without regard 
          to its conflict of law principles.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
        <p className="mb-4">
          For questions about these Terms, please contact us at kianerfaan@proton.me.
        </p>
      </section>
    </div>
  );
}