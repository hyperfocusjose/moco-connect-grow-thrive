
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VisitorSignupForm } from '@/components/forms/VisitorSignupForm';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero Section */}
      <section className="bg-maroon text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src="/moco-png-logo.png" 
                alt="MocoPNG Logo" 
                className="mx-auto h-24 w-auto mb-6"
              />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Montgomery County Professional Networking Group
              </h1>
              <p className="text-lg md:text-xl mb-8">
                Connect with local professionals and grow your business through meaningful relationships
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="bg-white text-maroon hover:bg-gray-100"
                size="lg"
              >
                Member Login
              </Button>
            </div>
            <div className="hidden md:block">
              {/* Placeholder for hero image */}
              <div className="bg-white/20 h-64 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Visitor Registration Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Join Us as a Visitor</h2>
              <p className="mb-4">
                We welcome visitors to experience our networking meetings. Register for an upcoming Tuesday meeting and see how our group can help grow your business.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <div className="bg-maroon/10 p-1 rounded-full mr-2">
                    <div className="w-2 h-2 bg-maroon rounded-full"></div>
                  </div>
                  <span>Weekly Tuesday meetings at 8:00 AM</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-maroon/10 p-1 rounded-full mr-2">
                    <div className="w-2 h-2 bg-maroon rounded-full"></div>
                  </div>
                  <span>Keller Williams Office in The Woodlands</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-maroon/10 p-1 rounded-full mr-2">
                    <div className="w-2 h-2 bg-maroon rounded-full"></div>
                  </div>
                  <span>Meet local business professionals</span>
                </li>
              </ul>
            </div>
            <div>
              <VisitorSignupForm />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Join Our Network?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-maroon/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-maroon"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Relationships</h3>
              <p className="text-gray-600">
                Connect with motivated professionals from diverse industries who are committed to helping each other succeed.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-maroon/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-maroon"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Grow Your Business</h3>
              <p className="text-gray-600">
                Get quality referrals from trusted sources and develop a powerful network of business advocates.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-maroon/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-maroon"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enhance Your Skills</h3>
              <p className="text-gray-600">
                Develop your professional skills through presentations, networking, and collaborating with experienced professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">What Our Members Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4">
                "Being part of this networking group has transformed my business. The quality of referrals and support from fellow members is incredible."
              </p>
              <p className="font-medium">- Jane Smith, Financial Advisor</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4">
                "I've gained not just clients but also mentors and friends. This group truly cares about helping each other succeed."
              </p>
              <p className="font-medium">- Mark Johnson, Marketing Consultant</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4">
                "The structured approach to networking and business development makes this group stand out. It's been invaluable for my practice."
              </p>
              <p className="font-medium">- Sarah Williams, Attorney</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 bg-maroon text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Visit us at our next Tuesday meeting to experience the power of professional networking.
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="bg-white text-maroon hover:bg-gray-100"
            size="lg"
          >
            Member Login
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
