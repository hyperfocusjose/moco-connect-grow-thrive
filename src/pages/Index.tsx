
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Header */}
      <header className="bg-maroon text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="font-bold text-xl tracking-tighter">MocoPNG</div>
            <div className="space-x-2">
              <Button asChild variant="ghost" className="text-white">
                <Link to="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button asChild variant="outline" className="text-white border-white hover:bg-white hover:text-maroon">
                <Link to="/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col">
        <section className="bg-gradient-to-b from-maroon to-maroon-dark text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Montgomery County Professional Networking Group</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Connect, grow, and thrive with professionals from Montgomery County. 
              Join our exclusive networking group to expand your business through 
              powerful connections.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-maroon">
                <Link to="/login">Member Login</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-maroon hover:bg-gray-100">
                <Link to="/signup">Join MocoPNG</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Join MocoPNG?</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-maroon-light rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">1</div>
                <h3 className="text-xl font-bold mb-2">Exclusive Seat Reservations</h3>
                <p className="text-gray-600">Claim your industry's exclusive seat in our group, ensuring you face no direct competition within the network.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-maroon-light rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">2</div>
                <h3 className="text-xl font-bold mb-2">Quality Referrals</h3>
                <p className="text-gray-600">Receive high-quality referrals from trusted professionals who understand your business needs.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-maroon-light rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">3</div>
                <h3 className="text-xl font-bold mb-2">Weekly Meetings</h3>
                <p className="text-gray-600">Attend our structured weekly meetings to build relationships and promote your business.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-maroon-light rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">4</div>
                <h3 className="text-xl font-bold mb-2">Business Growth</h3>
                <p className="text-gray-600">Leverage our proven system to grow your business through word-of-mouth marketing.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-maroon-light rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">5</div>
                <h3 className="text-xl font-bold mb-2">Networking Events</h3>
                <p className="text-gray-600">Participate in special events designed to strengthen your professional network.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-maroon-light rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">6</div>
                <h3 className="text-xl font-bold mb-2">Educational Presentations</h3>
                <p className="text-gray-600">Learn from fellow members through informative presentations about their industries.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-maroon text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Business?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join Montgomery County's premier professional networking group today.
            </p>
            <Button asChild size="lg" className="bg-white text-maroon hover:bg-gray-100">
              <Link to="/signup">Create an Account</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="font-bold text-xl tracking-tighter">MocoPNG</div>
              <p className="text-gray-400 text-sm">Montgomery County Professional Networking Group</p>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} MocoPNG. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
