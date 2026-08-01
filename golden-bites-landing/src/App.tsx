import Header from './components/Header';
import Hero from './components/Hero';
import MenuHighlights from './components/MenuHighlights';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Location from './components/Location';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main>
        <Hero />
        <MenuHighlights />
        <About />
        <Testimonials />
        <Location />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
