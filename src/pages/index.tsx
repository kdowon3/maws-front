import type { NextPage } from "next";
import Head from "next/head";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import ScenariosSection from "@/components/landing/ScenariosSection";
import TrustSection from "@/components/landing/TrustSection";
import CTASection from "@/components/landing/CTASection";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>MAWS - 페어가 끝난 뒤, 고객을 놓치지 마세요</title>
        <meta name="description" content="MAWS - Make Awesome! 갤러리 전용 백오피스 SaaS. 작품관리, 고객관리, SMS발송까지 자동화. 2025년 무료 혜택." />
        <meta name="keywords" content="갤러리, 작품관리, 고객관리, 보증서, 아트페어, 갤러리시스템" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph meta tags */}
        <meta property="og:title" content="MAWS - 페어가 끝난 뒤, 고객을 놓치지 마세요" />
        <meta property="og:description" content="MAWS - Make Awesome! 갤러리 전용 백오피스 SaaS. 작품관리, 고객관리, SMS발송까지 자동화. 2025년 무료 혜택." />
        <meta property="og:type" content="website" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.png" />
      </Head>
      
      <main className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <ScenariosSection />
        <TrustSection />
        <CTASection />
      </main>
    </>
  );
};

export default Home;
