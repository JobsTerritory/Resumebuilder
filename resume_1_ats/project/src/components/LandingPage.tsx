import React from 'react';
import { Sparkles, ArrowRight, CheckCircle, Zap, Shield, Award, Star, Menu, X } from 'lucide-react';


interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden selection:bg-brand-500/30">

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2 cursor-pointer">
              <a href="#landing" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="p-2 bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20">
                  <Sparkles className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-gray-900">
                  BuildMy<span className="text-brand-600">Resume</span>
                </span>
              </a>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              {['Features', 'Pricing'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-brand-600 transition-colors">
                  {item}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <a
                href="#login"
                className="text-gray-600 hover:text-brand-600 font-medium px-4 py-2 transition-colors"
              >
                Login
              </a>
              <a
                href="#signup"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full transition-all font-medium text-sm shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 hover:-translate-y-0.5 inline-block text-center"
              >
                Get Started
              </a>
            </div>

            <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6 text-lg font-medium">
            {['Features', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)}>
                {item}
              </a>
            ))}
            <hr className="border-gray-100" />
            <a href="#login" className="text-left py-2">Login</a>
            <a href="#signup" className="bg-brand-600 text-white py-3 rounded-xl text-center shadow-lg">Get Started</a>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <main className="pt-24 pb-16 lg:pt-28 lg:pb-24 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-50 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            <div className="flex-1 text-center lg:text-left z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 text-brand-700 font-medium text-sm mb-6 animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                AI-Powered 2.0 Now Live
              </div>

              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
                Build a professional resume in <span className="text-brand-600 relative whitespace-nowrap">
                  minutes
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-brand-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5 L 100 0 Q 50 5 0 0 Z" fill="currentColor" />
                  </svg>
                </span>.
              </h1>

              <p className="text-xl text-gray-500 mb-10 leading-relaxed">
                Use our AI-powered builder to create ATS-friendly resumes that stand out.
                Start from scratch or upload your existing resume to get an instant score.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#signup"
                  className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-brand-500/20 hover:scale-[1.02] transition-all inline-flex items-center justify-center gap-2"
                >
                  Build Your Resume Now <ArrowRight size={20} />
                </a>
                <button className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold text-lg transition-all hover:shadow-lg">
                  View Examples
                </button>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} className="w-8 h-8 rounded-full border-2 border-white ring-2 ring-gray-100" src={`https://randomuser.me/api/portraits/thumb/men/${20 + i}.jpg`} alt="User" />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-bold text-gray-900">4.9/5</span> rating from 10k+ users
                </div>
              </div>
            </div>

            <div className="flex-1 w-full max-w-lg relative z-20 perspective-1000">
              <div className="absolute -inset-4 bg-gradient-to-tr from-brand-200 to-purple-200 rounded-[2rem] blur-2xl opacity-50 -z-10 animate-pulse-slow"></div>
              <div className="relative transform rotate-y-12 rotate-x-6 hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out preserve-3d">
                <img
                  src="/hero_resume.png"
                  alt="Professional Resume Example"
                  className="w-full rounded-lg shadow-2xl border border-gray-200"
                />
                {/* Floating Elements for 3D effect */}
                <div className="absolute -right-12 top-1/4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-float-delay-1 hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">ATS Friendly</p>
                      <p className="text-xs text-gray-500">Verified</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -left-8 bottom-1/4 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-float-delay-2 hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Star size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Top 5%</p>
                      <p className="text-xs text-gray-500">Resume Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Trusted By Section */}
      <section className="py-10 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Trusted by professionals at top companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Google', 'Microsoft', 'Amazon', 'Netflix', 'Tesla'].map((company) => (
              <span key={company} className="text-xl md:text-2xl font-bold text-gray-400 hover:text-gray-600 cursor-default">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-brand-600 font-bold tracking-wide uppercase text-sm mb-3">Process</h2>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-gray-500 text-lg">
              Three simple steps to your new professional resume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

            {[
              {
                step: "01",
                title: "Upload or Start Fresh",
                desc: "Upload your existing resume for a free score, or start from scratch with our professional templates.",
                icon: <Zap size={24} className="text-white" />,
                color: "bg-blue-600"
              },
              {
                step: "02",
                title: "AI Optimization",
                desc: "Our AI engine analyzes your experience and suggests impactful improvements and keywords.",
                icon: <Sparkles size={24} className="text-white" />,
                color: "bg-purple-600"
              },
              {
                step: "03",
                title: "Download & Apply",
                desc: "Export your polished resume in PDF format and start applying to your dream jobs with confidence.",
                icon: <CheckCircle size={24} className="text-white" />,
                color: "bg-green-600"
              }
            ].map((item, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center group">
                <div className={`w-24 h-24 rounded-full ${item.color} flex items-center justify-center shadow-xl shadow-gray-200 mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-gray-900 shadow-md border border-gray-100">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 list-none">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-brand-600 font-bold tracking-wide uppercase text-sm mb-3">Features</h2>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose BuildMyResume?
            </h2>
            <p className="text-gray-500 text-lg">
              We provide the tools you need to get hired faster, from AI writing assistance to expert-approved templates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="text-white" size={24} />,
                title: "AI Writer",
                desc: "Beat writer's block with AI-generated summaries and bullet points tailored to your role.",
                color: "bg-orange-500"
              },
              {
                icon: <Shield className="text-white" size={24} />,
                title: "ATS Friendly",
                desc: "Our templates are designed to pass Applicant Tracking Systems used by 99% of Fortune 500s.",
                color: "bg-brand-500"
              },
              {
                icon: <Award className="text-white" size={24} />,
                title: "Expert Tips",
                desc: "Get real-time feedback and improvement suggestions as you build your resume.",
                color: "bg-blue-500"
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-brand-600 font-bold tracking-wide uppercase text-sm mb-3">Testimonials</h2>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Success Stories
            </h2>
            <p className="text-gray-500 text-lg">
              See what our users are saying about their job search success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Jenkins",
                role: "Product Manager",
                image: "https://randomuser.me/api/portraits/women/44.jpg",
                quote: "The AI suggestions were spot on. I landed interviews at 3 major tech companies within a week!"
              },
              {
                name: "Michael Chen",
                role: "Software Engineer",
                image: "https://randomuser.me/api/portraits/men/32.jpg",
                quote: "I was struggling to get past ATS filters. After using this builder, my response rate tripled."
              },
              {
                name: "Emily Rodriguez",
                role: "Marketing Director",
                image: "https://randomuser.me/api/portraits/women/68.jpg",
                quote: "The templates are beautiful and professional. It made my 10 years of experience look organized and impressive."
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 relative hover:shadow-lg transition-shadow">
                <div className="flex text-yellow-400 mb-4 gap-1">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} fill="currentColor" />)}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full ring-2 ring-white" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-900/40 to-transparent"></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to upgrade your career?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of job seekers who have successfully landed interviews at top companies.
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-4 bg-brand-500 text-white rounded-full font-bold text-lg shadow-2xl shadow-brand-500/30 hover:bg-brand-400 hover:scale-105 transition-all"
          >
            Create Your Resume Free
          </button>
          <p className="mt-6 text-sm text-gray-500">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16 text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-900 rounded-lg">
                <Sparkles className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900">BuildMyResume</span>
            </div>
            <div className="flex gap-8 font-medium">
              <a href="#" className="hover:text-brand-600">Privacy</a>
              <a href="#" className="hover:text-brand-600">Terms</a>
              <a href="#" className="hover:text-brand-600">Contact</a>
            </div>
            <p>&copy; 2025 BuildMyResume. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

