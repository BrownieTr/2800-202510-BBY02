import GlassNavbar from '../components/layout/glassNavbar';
import GlassButton from '../components/ui/glassButton';
import LoginButton from '../components/ui/loginButton';
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="pt-6 relative min-h-screen from-slate-900 to-slate-800 text-white overflow-hidden pb-8">
      {/* Background decoration */}
      <div className="fixed top-[-120px] left-[-120px] w-[400px] h-[400px] bg-pink-500 rounded-full blur-[180px] opacity-30 -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-120px] right-[-120px] w-[400px] h-[400px] bg-blue-500 rounded-full blur-[180px] opacity-30 -z-10 pointer-events-none"></div>

      <GlassNavbar title="PlayPal" rightContent={<LoginButton />} />

      <main className="px-6 pt-16 text-center max-w-6xl mx-auto">
        {/* Hero Section */}
        <section id="hero" className="mb-10 flex flex-col items-center justify-center">
          <h1 className="text-6xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
            PlayPal
          </h1>
          <p className="text-2xl text-slate-200 opacity-90 mb-10 max-w-xl">
            Find people to play sports with, online or in person.
          </p>
          <GlassButton className="px-10 py-5 text-xl font-semibold" onClick={() => navigate("/signup")}> 
            Get Started
          </GlassButton>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-3">
          <h2 className="text-center font-extrabold mb-12 text-4xl sm:text-5xl text-white">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="mb-4 p-8 rounded-lg shadow-lg bg-gradient-to-tr from-pink-700 via-purple-700 to-blue-700 text-white">
              <h3 className="font-bold text-3xl mb-4">Match with Other Players</h3>
              <p className="text-lg leading-relaxed">
                Find competitors based on location, timing and skill level. 🏆
              </p>
            </div>

            {/* Feature 2 */}
            <div className="mb-4 p-8 rounded-lg shadow-lg bg-gradient-to-tr from-pink-700 via-purple-700 to-blue-700 text-white">
              <h3 className="font-bold text-3xl mb-4">Chat with Other Users</h3>
              <p className="text-lg leading-relaxed">
                Communicate directly with potential opponents to arrange matches. 💬
              </p>
            </div>

            {/* Feature 3 */}
            <div className="mb-4 p-8 rounded-lg shadow-lg bg-gradient-to-tr from-pink-700 via-purple-700 to-blue-700 text-white">
              <h3 className="font-bold text-3xl mb-4">Find or Organize Events</h3>
              <p className="text-lg leading-relaxed">
                Create, delete or sign up for local sporting events in your community. 📅
              </p>
            </div>

            {/* Feature 4 */}
            <div className="mb-4 p-8 rounded-lg shadow-lg bg-gradient-to-tr from-pink-700 via-purple-700 to-blue-700 text-white">
              <h3 className="font-bold text-3xl mb-4">Wagering on Matches</h3>
              <p className="text-lg leading-relaxed">
                Add excitement with friendly wagers on your competitions. 🎲
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900 text-slate-400 py-1 border-t border-slate-700 w-full z-50">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-sm">
          <span>&copy; {new Date().getFullYear()} PlayPal. All rights reserved.</span>
          <div className="mt-2 sm:mt-0 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
