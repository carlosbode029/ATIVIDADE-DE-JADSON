import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Simulator } from "@/components/Simulator";
import { Differentials } from "@/components/Differentials";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col">
        <Hero />
        <HowItWorks />
        <Simulator />
        <Differentials />
        <Faq />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
