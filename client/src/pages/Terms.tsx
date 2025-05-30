import React from 'react';
import { Link } from 'wouter';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Terms of Service for theOxus.com</h1>
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
          Welcome to TheOxus.com, a news aggregation platform operated solely by Kian Erfaan Jamasbi, JD, in Pennsylvania, USA. By accessing our web application, you agree to abide by our Terms of Service, which govern your use of the App. These terms outline that your subscription primarily supports the App's development, without guarantees of uninterrupted service, availability, or uptime. As a one-person operation, TheOxus may experience bugs or crashes, and while we strive to address issues promptly, immediate fixes are not always possible. If you do not agree with these terms, you must refrain from using the App.
        </p>
        
        <p className="mb-4 leading-relaxed">
          TheOxus prohibits any unlawful, fraudulent, or harmful use of the platform, with the maintainer reserving the right to determine what constitutes inappropriate use. We are not liable for any damages—direct, indirect, or otherwise—arising from your use, inability to use, or reliance on the App or its content. These terms may be updated at our discretion, and users are encouraged to review them periodically. By using TheOxus, you fully accept these conditions. For any inquiries, contact Kian Jamasbi at kian.jamasbi@gmail.com through the App.
        </p>
      </section>
    </div>
  );
}