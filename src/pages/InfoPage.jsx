import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import mermaid from 'mermaid';
import EcosystemChart from '../components/EcosystemChart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { X } from 'lucide-react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import HomePage from '../components/home';

const Section = ({ id, children }) => (
  <section id={id} className="py-20 px-4 md:px-8 relative">
    <div className="max-w-7xl mx-auto relative z-10">
      {children}
    </div>
  </section>
);

const SectionTitle = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    viewport={{ once: true }}
    className="text-center mb-16"
  >
    <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-sky-700 bg-clip-text text-transparent">
      {children}
    </h2>
  </motion.div>
);

const InvestorPackage = () => {
    const [selectedNode, setSelectedNode] = useState(null);
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      };
    
      return (
        <div className="min-h-screen bg-white overflow-x-hidden">
          <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <img
                    src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Logoff.png"
                    alt="FreshFront Logo"
                    className="h-8 w-auto"
                  />
                </div>
                <div className="hidden md:block">
                  <ul className="ml-10 flex items-baseline space-x-4">
                    <li><a onClick={() => scrollToSection('hero')} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Home</a></li>
                    <li><a onClick={() => scrollToSection('opportunity')} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Opportunity</a></li>
                    <li><a onClick={() => scrollToSection('solution')} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Solution</a></li>
                    <li><a onClick={() => scrollToSection('market')} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Market</a></li>
                    <li><a onClick={() => scrollToSection('budget')} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Budget</a></li>
                    <li><a onClick={() => scrollToSection('team')} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Team</a></li>
                    <li><a onClick={() => scrollToSection('ecosystem')} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Ecosystem</a></li>
                    <li><a onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Contact</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
    
          <header id="hero" className="relative h-screen flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%201.png')" }}>
          </header>
    
          <Section id="opportunity">
            <SectionTitle>Executive Summary</SectionTitle>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.img
                src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%202.png"
                alt="3 Simple Steps"
                className="rounded-lg"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              />
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>The Opportunity</CardTitle></CardHeader>
                  <CardContent>
                    <p>The digital creator economy is a rapidly expanding market projected to reach nearly $500 billion by 2027, driven by over 400 million global creators. A significant market gap exists as current e-commerce solutions require technical skills, creating a barrier for the 64% of amateur creators. FreshFront is an AI-first platform that transforms anyone into an e-commerce entrepreneur in minutes, not months. Our proprietary AI stack generates complete stores—designs, products, collections, site content, and marketing materials—from a single prompt, eliminating technical hurdles. By creating a virtuous ecosystem where creators, managers, and customers all benefit, FreshFront empowers anyone to capitalize on the immense and growing demand within the creator economy.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Section>
    
          <Section id="market">
            <SectionTitle>The Creator Economy</SectionTitle>
            <Card className="mb-8">
              <CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
              <CardContent>
                <p>The digital creator economy stands as a monumental and rapidly expanding sector within the global digital landscape. This report provides a comprehensive overview of its immense scale, projected growth, and strategic importance, dissecting the digital creator market.</p>
                <p className="mt-4">The digital creator economy represents a dynamic ecosystem where individuals leverage their creative skills to produce and monetize content across diverse online platforms. This encompasses a broad spectrum of professionals and hobbyists who utilize technology to engage audiences, cultivate communities, and establish personal brands. The foundation of this economy rests heavily on social media platforms, increasingly sophisticated AI-driven tools, and the emergence of decentralized platforms, all of which empower creators to operate and monetize their content with greater autonomy.</p>
                <p className="mt-4">The global creator economy is a multi-hundred-billion-dollar market, consistently projected for exponential growth despite some variability in current valuation estimates. In 2024, the market's valuation ranges from approximately $125.11 billion to $191.55 billion, and even up to $300 billion by other accounts. The segment specifically focused on creator economy platforms alone was valued at $161.97 billion in 2024. This range in market size estimates reflects the nascent and rapidly evolving nature of the market, where different research firms define and measure the "creator economy" with varying scopes. For instance, some estimates may focus solely on direct creator earnings, while others encompass supporting infrastructure, brand expenditure on influencer marketing, and platform revenues. This variability indicates a lack of standardized metrics and a market that is still defining itself. For investors, this suggests significant growth potential but also inherent complexities in precise measurement. For service providers, it highlights a fragmented market where clear value propositions are essential. This also presents an opportunity for analytics and market intelligence firms to develop more precise and universally accepted measurement frameworks.</p>
                <p className="mt-4">Looking ahead, the market is expected to reach $436.71 billion by 2029, growing at a Compound Annual Growth Rate (CAGR) of 28.4%. Other projections indicate a rise to $528.39 billion by 2030 at a CAGR of 22.5%, or even a substantial $1,072.8 billion by 2034 at a CAGR of 21.8%. The creator economy platforms market alone is forecast to reach $701.06 billion by 2034, with a CAGR of 15.8%. Forecasts from Goldman Sachs suggest the broader creator economy could nearly double to $480 billion by 2027, or even $500 billion by 2027. North America consistently maintains a dominant market share, exceeding 37% in 2024.</p>
              </CardContent>
            </Card>
            <Card className="mb-8">
              <CardHeader><CardTitle>1. Introduction: Defining the Digital Creator Economy</CardTitle></CardHeader>
              <CardContent>
                <h4 className="font-bold">What is a Digital Creator?</h4>
                <p>A digital creator is an individual who conceptualizes, produces, and publishes original content across various online platforms, each catering to a specific audience. This encompasses a wide array of content formats, including written articles, photography, videos, and audio productions. Unlike traditional media creators who might have primarily worked in print, television, or radio, digital creators consist of mainly Gen Z & Alpha who specifically craft experiences intended for consumption (mainly social media) on screens—be it a smartphone, tablet, computer, or smart TV.</p>
                <p className="mt-4">A crucial distinction exists between a digital creator and an influencer, despite significant overlap. Digital creators primarily focus on crafting original, high-quality, and often niche-specific content. Their value is derived from the unique content they produce, whether it stems from their expertise, passion, or artistic skill. Their objective is to entertain, educate, or inspire their audience, often contributing novel and unique perspectives to the online landscape. An influencer, conversely, typically leverages a significant following and credibility within a specific online community to promote products, services, or ideas. While influencers may also create content, their primary focus is on shaping perceptions and driving engagement around brands. This distinction between "digital creator" and "influencer" is not merely semantic; it signifies a fundamental shift in value perception within the digital ecosystem. The emphasis has moved from simple reach or follower count, often associated with traditional influencer marketing, towards authenticity, specialized knowledge, and deep audience engagement. This evolution suggests that for brands, effective engagement now requires moving beyond one-off sponsored posts to deeper, more collaborative partnerships that genuinely align with a creator's authentic content and established audience relationships. For platforms and tool providers, this implies a growing necessity to support robust content creation and community management tools, rather than solely focusing on monetization or reach metrics.</p>
                <h4 className="font-bold mt-4">Key Categories of Digital Creators</h4>
                <p>The digital creator landscape is remarkably diverse, encompassing a multitude of specializations that cater to varied audiences and content formats:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>Visual Artists:</strong> This category includes Painters/Illustrators & Graphic Designers, who are adept at creating compelling images, logos, and layouts for digital and print media. Also prominent are Animators and Motion Graphics Designers, who specialize in bringing static images to life through animation and visual effects for films, television, websites, and digital advertising.</li>
                  <li><strong>Content Producers:</strong> This broad group includes general Content Creators who produce a wide array of content such as blog posts, videos, podcasts, and social media updates, skilled in crafting engaging narratives for specific niches. A more specialized segment comprises Video Producers and Editors, who manage all aspects of video content creation, from scripting and filming to post-production, essential for entertainment, digital marketing, and independent creators.</li>
                  <li><strong>Interactive & Community-Focused Creators:</strong> This segment includes Streamers and Influencers, who build communities around their personalities and interests on platforms like Twitch, YouTube Live, or Instagram, engaging audiences in real-time while promoting their own merch. Additionally, UX/UI Designers are vital digital creators responsible for optimizing the usability and design of digital products like websites and applications, ensuring seamless user experiences. The broader creator economy also integrates bloggers, vloggers, and podcasters, all of whom leverage technology to engage audiences and cultivate their personal brands.</li>
                </ul>
                <h4 className="font-bold mt-4">The Ecosystem of the Creator Economy</h4>
                <p>The great expansion of the digital creator economy is intricately linked to a supportive ecosystem. This environment is primarily fueled by the pervasive adoption of social media platforms such as TikTok & Instagrams Creator Marketplaces, the continuous development of AI-driven tools, and the increasing proliferation of decentralized platforms. These interconnected elements collectively empower creators to monetize their skills and content independently, fostering a dynamic digital marketplace. The comprehensive nature of this economy extends beyond individual creators to encompass the entire infrastructure that supports them, including content production tools, C2C (Creator to Creator) networking, sophisticated analytics platforms for performance tracking, and the underlying digital infrastructure that facilitates content delivery and monetization.</p>
              </CardContent>
            </Card>
            <Card className="mb-8">
              <CardHeader><CardTitle>2. Total Addressable Market (TAM) for Digital Creators</CardTitle></CardHeader>
              <CardContent>
                <h4 className="font-bold">Global Market Size and Projections (2024-2034)</h4>
                <p>The global creator economy exhibits a substantial and rapidly expanding market value. In 2024, its valuation is estimated to be approximately $191.55 billion, a figure that some sources indicate as the 2025 valuation with 2024 at $156.37 billion. Other reports place the 2024 value at $125.11 billion, $149.4 billion, $250 billion, or even $300 billion. The market specifically for creator economy platforms was valued at $161.97 billion in 2024. This variability in current market valuations underscores the complexity inherent in defining and measuring this evolving market, as different methodologies may include or exclude various components of the ecosystem.</p>
                <p className="mt-4">The market is projected for exponential growth over the next decade. It is expected to grow from $125.11 billion in 2024 to $160.91 billion in 2025 at a CAGR of 28.6%, with projections reaching $436.71 billion by 2029 at a CAGR of 28.4%. Other forecasts predict it will hit $528.39 billion by 2030, growing at a CAGR of 22.5% from a 2023 base of $127.65 billion. A more expansive projection indicates a market worth around $1,072.8 billion by 2034, originating from $149.4 billion in 2024, demonstrating a robust CAGR of 21.8%. The creator economy platforms market alone is expected to reach $701.06 billion by 2034, exhibiting a CAGR of 15.8%. Shorter-term forecasts from Goldman Sachs suggest the market could nearly double to $480 billion by 2027, or even $500 billion by 2027.</p>
              </CardContent>
            </Card>
            <Card className="mb-8">
              <CardHeader><CardTitle>3. Serviceable Available Market (SAM) for Digital Creators</CardTitle></CardHeader>
              <CardContent>
                <h4 className="font-bold">Segmentation by Creator Type</h4>
                <p>The digital creator market is distinctly segmented by the level of professional engagement:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                    <li><strong>Amateur Creators:</strong> This segment constitutes the majority of the market, accounting for 64.1% of creators in 2024. Their dominance is primarily driven by the low entry barriers to content creation, facilitated by widespread access to smartphones, intuitive editing applications, generative AI and readily available monetization tools on popular platforms like TikTok, YouTube, and Instagram.</li>
                    <li><strong>Professional Creators:</strong> This segment comprises 35.9% of the market in 2024, representing individuals who pursue content creation as a structured, full-time career.</li>
                </ul>
                <h4 className="font-bold mt-4">Market Share by Content Format</h4>
                <p>The digital content landscape is heavily influenced by consumer preferences for various formats:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                    <li><strong>Video Content:</strong> This format unequivocally dominates the market, holding more than a 23.8% share in 2024 and accounting for over 50% of the revenue share within the creator economy platforms market.</li>
                    <li><strong>Music Content:</strong> Following video, music content holds an 18.3% share, a segment boosted by the rising popularity of short-form audio, independent artists, and streaming growth.</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="mb-8">
              <CardHeader><CardTitle>4. Monetization Strategies and Revenue Streams</CardTitle></CardHeader>
              <CardContent>
                <h4 className="font-bold">Primary Monetization Methods and Their Proportions (2024)</h4>
                <p>Digital creators employ a diverse array of methods to monetize their content and audience engagement:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                    <li><strong>Brand Collaborations:</strong> This stands as the top monetization method, accounting for 23.5% of revenue share.</li>
                    <li><strong>Advertising Revenue:</strong> This method accounts for 20.9% of the market share.</li>
                    <li><strong>Subscriptions:</strong> This model holds a 20.0% share of monetization methods.</li>
                    <li><strong>Affiliate Marketing:</strong> This method accounts for 12.5% of creator monetization.</li>
                </ul>
              </CardContent>
            </Card>
          </Section>
          <Section id="creator-platforms">
            <SectionTitle>Recent Creator Platforms</SectionTitle>
            <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader><CardTitle>Instagram Creator Marketplace</CardTitle></CardHeader>
              <CardContent>
                <img src="https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/IMG_6489.webp?alt=media&token=f79511e2-e85f-4d4f-8208-9afc5d72059e" alt="Instagram Creator Marketplace" className="rounded-lg mb-4" />
                <p>Connects brands and creators within the Meta ecosystem. Features AI-boosted discovery, direct messaging, and campaign management. No explicit platform fee; rates are negotiated directly. Strengths include streamlined discovery and high potential for ROI, but creators have expressed dissatisfaction with low-budget campaigns.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>TikTok Creator Marketplace</CardTitle></CardHeader>
              <CardContent>
                <img src="https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/IMG_6497.webp?alt=media&token=a8c43aaf-8794-45a9-a96b-f7990d9d651d" alt="TikTok Creator Marketplace" className="rounded-lg mb-4" />
                <p>TikTok's official platform for collaborations. It's free to use and features a vast creator pool, fostering authentic, trend-driven content. While there are no platform fees for collaborations, the high follower requirement for creators can be a limitation.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>YouTube BrandConnect</CardTitle></CardHeader>
              <CardContent>
                <img src="https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/IMG_6500.gif?alt=media&token=b242f001-758c-41fb-a663-edf5935143bf" alt="YouTube BrandConnect" className="rounded-lg mb-4" />
                <p>A premium service for larger brands and macro-influencers on YouTube. It offers deep integration with Google Ads, extensive analytics (including Brand Lift metrics), and robust compliance support. It comes with a 10% service fee and is currently invite-only.</p>
                <h4 className="font-bold mt-4">Product Cards for Google Merchants</h4>
                <p>YouTube offers great opportunities to showcase your own products, be discovered and allow YouTube audiences to check out on your website. There are several ways to show your products on YouTube, depending on which programs you participate in.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Shopify App Marketplace</CardTitle></CardHeader>
              <CardContent>
                <img src="https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/IMG_6502.webp?alt=media&token=5e57c4fc-14ab-404d-b4d6-f4cdf223904c" alt="Shopify App Marketplace" className="rounded-lg mb-4" />
                <p>An indispensable extension of the Shopify platform, with over 8,000 apps enhancing capabilities for over 20 million stores. It allows for a high degree of customization and operational efficiency. Challenges include app saturation, quality inconsistencies, and potential hidden costs.</p>
              </CardContent>
            </Card>
            </div>
          </Section>
    
          <Section id="solution">
            <SectionTitle>Product Deep Dive: Platform Walkthrough</SectionTitle>
            <video loop playsInline controls className="w-full h-full object-cover rounded-lg mb-12 mx-auto">
              <source src="https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/Video.mp4?alt=media&token=fc959276-e2d5-46f4-a632-e13d553d9832" type="video/mp4" />
            </video>
            <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%206.png" alt="Platform Walkthrough" className="rounded-lg mb-12 mx-auto" />
            <div className="space-y-8">
              <Card>
                <CardHeader><CardTitle>Core Platform Architecture</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.png" alt="User Prompt Mode" className="rounded-lg" />
                    <div className="space-y-4">
                        <div>
                      <h4 className="font-bold">AI Technology Stack</h4>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li><strong>Google GenAI SDK:</strong> Gemini Flash, Pro, Imagen, Veo models used for product analysis, content generation, store optimization, product recognition and design optimization, and customer support as well as other tasks.</li>
                        <li><strong>Apple Foundation Models:</strong> On device AI models used to create blogs, plan templates and site content changes offline (requires no internet connection)</li>
                        <li><strong>Anthropic Claude:</strong> Sonnet 4 involved in template planning & code generation, assisting the gemini models.</li>
                        <li><strong>OpenAI:</strong> GPT Image 1 model used for advanced design requiring accurate text and attention to detail</li>
                        <li><strong>Meshy AI:</strong> Used to generate 3D models of Creators products for the integrated AR viewer on product pages</li>
                        <li><strong>Custom LLMs:</strong> Fine-tuned models for e-commerce specific tasks</li>
                      </ul>
                        </div>
                        <div>
                          <h4 className="font-bold">Platform Components</h4>
                          <ol className="list-decimal list-inside space-y-1 mt-2">
                            <li>Store Builder: 3 creation modes (Prompt, Step-by-Step, Import) & 3 store types (Inventory, Print on Demand, Dropshipping)</li>
                            <li>Design Engine: AI-powered product design & store template generation</li>
                            <li>Content Management: Automated copywriting, images, video and SEO</li>
                            <li>Marketing Suite: Automated ad creation and campaign management</li>
                            <li>Fulfillment Integration: Seamless print-on-demand and dropshipping integration</li>
                            <li>Analytics Dashboard: Comprehensive performance tracking</li>
                          </ol>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Cross Beneficial Ecosystem & Value Propositions</CardTitle></CardHeader>
                <CardContent>
                  <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%2021.png" alt="Value Propositions" className="rounded-lg mb-6 mx-auto" />
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-bold">For Creators</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li><strong>5-Minute Store Creation:</strong> Complete e-commerce store from simple prompt</li>
                        <li><strong>Zero Learning Curve:</strong> No technical knowledge required</li>
                        <li><strong>Professional Quality:</strong> AI generated production-level outputs</li>
                        <li><strong>Multiple Revenue Streams:</strong> POD, dropshipping, and inventory options</li>
                        <li><strong>Scalable Growth:</strong> AI handles complexity as business grows</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold">For Managers</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li><strong>Service Scaling:</strong> Manage multiple creators stores with AI automation</li>
                        <li><strong>Recurring Revenue:</strong> Earn fees from all transactions, from all stores of the Creators they onboard</li>
                        <li><strong>Low Touch Operations:</strong> AI reduces manual work by up to 80%</li>
                        <li><strong>Marketing Automation:</strong> Multi-creator campaign management</li>
                        <li><strong>Performance Analytics:</strong> Monitor store data & make decisions from your dashboard</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold">For Customers</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li><strong>Enhanced Shopping:</strong> AI-powered personalization and support</li>
                        <li><strong>Better Discovery:</strong> Intelligent search and recommendation engine</li>
                        <li><strong>Visual Shopping:</strong> AI & AR product visualization options</li>
                        <li><strong>More Variety:</strong> Shop from your friends or your favorite creators</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>3. Store Creation Modes</CardTitle></CardHeader>
                <CardContent>
                  <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%204.png" alt="Store Creation Modes 2" className="rounded-lg w-full mb-6" />
                  <p>FreshFront offers multiple ways to create a store, catering to different user needs and technical comfort levels.</p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-bold">Mode 1: User Prompt (Fastest Setup)</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li><strong>Initial Setup:</strong> User enters a Store Name and a simple text prompt describing their dream store. They can include things like their design, product, brand or niche details as well as template specifics ex. theme colors, style, effects, animations etc. </li>
                        <li><strong>AI Analysis & Generation:</strong> The platform analyzes the prompt to determine the store type (Inventory, Print on Demand, Dropshipping) and automatically generates everything: branding, products, collections, template, site content (text, images, video) and a starter content marketing package with multiformat ad copies.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold">Mode 2: Step by Step (Detailed Customization)</h4>
                      <ol className="list-decimal list-inside text-sm space-y-1 mt-2">
                        <li><strong>Category/Niche Selection:</strong> Choose a niche with help from AI-powered market analysis.</li>
                        <li><strong>Store Name Creation:</strong> Enter a name or get AI suggestions.</li>
                        <li><strong>Logo Creation:</strong> Upload an existing logo or have the AI generate one.</li>
                        <li><strong>Product Management:</strong> Add products via upload (inventory, POD), AI generation (POD), catalog (dropshipping) or import (inventory).</li>
                        <li><strong>Collection Organization:</strong> Let AI intelligently group products into collections or create your own.</li>
                        <li><strong>Finishing Touches:</strong> Describe the desired store personality for good measure.</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-bold">Mode 3: Import (Existing Store Migration)</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li><strong>Supported Platforms:</strong> Shopify, Etsy, BigCommerce.</li>
                        <li><strong>Import Process:</strong> Provide access key from source platform, select the data to migrate (products, collections, branding, etc.), and let FreshFront handle the rest of the store based on your imported content.</li>
                      </ul>
                      <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront%20(1).png" alt="Store Migration" className="rounded-lg mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>4. AI-Powered Features</CardTitle></CardHeader>
                <CardContent>
                  <h4 className="font-bold">AI Product Insights & Generation</h4>
                  <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%2014.png" alt="AI Product Insights" className="rounded-lg my-4 mx-auto" />
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Product Recommendations:</strong> Get instant product ideas for any niche based on market analysis, real-time purchase data, search trends, social media hashtags, articles & more.</li>
                    <li><strong>Design Inspiration:</strong> See which designs are selling and generate new designs inspired by the winners.</li>
                    <li><strong>Audience Insights:</strong> The AI provides detailed target audience personas, including SEO keywords, interests, pain points, and goals.</li>
                    <li><strong>Variant Generation:</strong> The AI automatically detects product attributes (size, color) and can generate visual mockups for each variant, eliminating the need for manual photography.</li>
                  </ul>
                  <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%2010.png" alt="AI Variant Generation" className="rounded-lg my-4 mx-auto" />
                  <h4 className="font-bold mt-6">Integrated Content Creator</h4>
                  <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%2011.png" alt="Integrated Content Creator" className="rounded-lg my-4 mx-auto" />
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>Marketing Asset Creation:</strong> The AI automatically generates 6 image ads and 4 video ads in various formats (post, reel, carousel, etc.) upon store creation.</li>
                    <li><strong>Content Creation Studio:</strong> Users can generate new images or videos from their product catalog by simply describing a scene (e.g., "place this mug on a beach table").</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>5. Customer Experience Features</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold">Integrated Product Visualizer</h4>
                      <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%209.png" alt="Product Visualizer" className="rounded-lg my-4" />
                      <p>On each product page, an instant AI visualizer allows customers to preview the product on themselves (fashion), in their space (home decor), or in various contexts. This leads to higher conversions (once they see it in their own context they feel the need to own it aka endowment effect), as well as lower return rates (they know what to expect and are already happy with it).</p>
                    </div>
                    <div>
                      <h4 className="font-bold">Integrated AI Chat Assistant</h4>
                      <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%208.png" alt="AI Chat Assistant" className="rounded-lg my-4" />
                      <p>Every store comes with an AI chatbot trained on store-specific data. It can recommend & visualize products as well as add them to the cart, answer FAQs, collect support tickets, and be programmed with a custom knowledge base by the creator/manager. It can also be interacted with in realtime via voice.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>6. Dashboard & Analytics</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold">Integrated Store Dashboard</h4>
                      <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%2013.png" alt="Store Dashboard" className="rounded-lg my-4" />
                      <p>A central hub to manage customers, fulfill orders, pay out funds, design products, edit the store, create social media content, and manage marketing campaigns. All sales data is real-time via the Stripe integration.</p>
                    </div>
                    <div>
                      <h4 className="font-bold">Integrated Storefolio (for Managers)</h4>
                      <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%2012.png" alt="Storefolio" className="rounded-lg my-4" />
                      <p>A 'Storefolio' that displays all stores from creators registered with the manager. Managers can track performance, prepare AI tasks, and manage brand assets across multiple stores from one place.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>
    
          <Section id="financials">
            <SectionTitle>Business Model & Revenue Streams</SectionTitle>
            <div className="grid md:grid-cols-1 gap-8">
              <Card>
                <CardHeader><CardTitle>Primary Revenue Sources</CardTitle></CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-4">
                    <li><strong>Transaction Fees</strong>
                      <ul className="list-disc list-inside ml-4 text-sm">
                        <li><strong>Independent Creator:</strong> 2.9% + $0.30 per transaction (Stripe standard)</li>
                        <li><strong>Manager-Referred Creators:</strong> Manager sets custom fee (1-5% typical)</li>
                        <li><strong>Volume Scaling:</strong> Reduced rates for high-volume creators</li>
                      </ul>
                    </li>
                    <li><strong>Subscriptions & Credits</strong>
                      <ul className="list-disc list-inside ml-4 text-sm">
                        <li><strong>Manager Monthly:</strong> $99/month</li>
                        <li><strong>Creator Monthly:</strong> $29.99/month</li>
                        <li><strong>Credits:</strong> Free users can buy store generation credits</li>
                        <li><strong>Annual Discounts:</strong> 15% discount for annual payments</li>
                      </ul>
                    </li>
                    <li><strong>Manager Enterprise</strong>
                      <ul className="list-disc list-inside ml-4 text-sm">
                        <li>Advanced AI Tools: Superpower with beta features</li>
                        <li>Priority Support: Dedicated account management</li>
                        <li>Custom Integrations: Enterprise-level API access</li>
                        <li>White Label: Branded platform solutions</li>
                      </ul>
                    </li>
                    <li><strong>Marketplace Commission</strong>
                      <ul className="list-disc list-inside ml-4 text-sm">
                        <li><strong>Template Marketplace:</strong> Users can buy/sell generated templates</li>
                        <li><strong>Store Marketplace:</strong> Creators can buy/sell active stores to other Creators or Managers</li>
                        <li><strong>Design Marketplace:</strong> Creators can buy/sell designs from other Creators and place them on their products</li>
                        <li><strong>Service Marketplace (like Fiverr):</strong> Creators/Managers can offer and purchase marketing & design services from other Creators/Managers</li>
                      </ul>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-8">
              <CardHeader><CardTitle>Stripe Connect Architecture</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center pt-6">
                <p>The platform is built on Stripe Connect, allowing for seamless onboarding, secure payments, and automated revenue splitting between Creators and Managers. Users register their business with Stripe, allowing them to receive payments, manage customers, orders, and payouts.</p>
                <img src="https://utdrojtjfwjcvuzmkooj.supabase.co/storage/v1/object/public/content//Copy%20of%20FreshFront.zip%20-%2016.png" alt="Stripe Connect" className="rounded-lg mt-4 w-full" />
              </CardContent>
            </Card>
          </Section>
    
          <Section id="ecosystem">
            <SectionTitle>Ecosystem</SectionTitle>
            <Card>
              <CardContent className="pt-6">
                <EcosystemChart setSelectedNode={setSelectedNode} />
              </CardContent>
            </Card>
          </Section>
    
          <section id="financial-projections" className="py-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <SectionTitle>Financial Projections</SectionTitle>
            </div>
            <Card className="w-full rounded-none border-x-0">
              <CardHeader className="max-w-7xl mx-auto px-4 md:px-8"><CardTitle>Annual Revenue Projection</CardTitle></CardHeader>
              <CardContent style={{ height: '500px' }} className="px-0">
                <ResponsiveBar
                  data={[
                    { stream: 'Paid Creators', revenue: 40.4, color: '#2457ff' },
                    { stream: 'Free Creators', revenue: 39.5, color: '#017852' },
                    { stream: 'Creator Withdrawal Fees', revenue: 15.2, color: '#a724ff' },
                    { stream: 'Managers', revenue: 4.9, color: '#ffc524' },
                  ]}
                  keys={['revenue']}
                  indexBy="stream"
                  margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  colors={{ datum: 'data.color' }}
                  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Revenue Stream',
                    legendPosition: 'middle',
                    legendOffset: 32,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Revenue (%)',
                    legendPosition: 'middle',
                    legendOffset: -40,
                    format: value => `${value}%`,
                  }}
                  label={bar => (bar.data.stream === 'Delegated Fees' ? `${bar.value}%` : '')}
                  labelTextColor={'white'}
                  animate={true}
                  tooltip={({ indexValue, value }) => (
                    <strong style={{ color: 'black' }}>
                      {`${indexValue}: ${value}%`}
                    </strong>
                  )}
                />
              </CardContent>
            </Card>
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <Card className="mt-8">
                  <CardHeader><CardTitle>Financial Model Structure</CardTitle></CardHeader>
                  <CardContent>
                    <h4 className="font-bold mt-4 mb-2">Fee Structure</h4>
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Creator Subscription Fee:</strong> $29.99/month</li>
                      <li><strong>Manager Subscription Fee:</strong> $99/month</li>
                      <li><strong>Standard Transaction Fee:</strong> 2.9% + $0.30 per transaction</li>
                      <li><strong>Manager Withdrawal Fee:</strong> 2.9%</li>
                      <li><strong>Creator Withdrawal Fee:</strong> 2.9%</li>
                      <li><strong>Manager Fee Delegation:</strong> Managers can set a custom fee (standard 2%) on their referred creators' sales, which is deducted from the creators' earnings and paid to the manager.</li>
                    </ul>
    
                    <h4 className="font-bold mt-6 mb-2">User Base Breakdown</h4>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Total Users:</strong> 7,000</li>
                        <li><strong>Paid Creators:</strong> 1,800 users (1,800 stores)</li>
                        <li><strong>Free Creators:</strong> 5,200 users</li>
                        <li><strong>Managers:</strong> 250 managers (managing 300 stores)</li>
                    </ul>
    
                    <h4 className="font-bold mt-6 mb-2">Revenue Calculations</h4>
                    <p className="font-semibold">Paid Creators (1,800 users with stores)</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Subscription Revenue:</strong> 1,800 users × $29.99/month × 12 months = $647,676</li>
                        <li><strong>Transaction Fee Revenue:</strong> 1,800 stores × $8,000 avg revenue × 0.029 = $417,600</li>
                        <li><strong>Per-Transaction Fees:</strong> 1,800 users × 1,833 transactions × $0.30 = $989,940</li>
                        <li><strong>Paid Creators Total:</strong> $2,055,216</li>
                    </ul>
                    <p className="font-semibold mt-4">Free Creators (5,200 users)</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Transaction Fee Revenue:</strong> 5,200 users × $2,500 avg revenue × 0.029 = $377,000</li>
                        <li><strong>Per-Transaction Fees:</strong> 5,200 users × 1,047 transactions × $0.30 = $1,633,320</li>
                        <li><strong>Free Creators Total:</strong> $2,010,320</li>
                    </ul>
                    <p className="font-semibold mt-4">Managers (250 managers managing 300 stores)</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Subscription Revenue:</strong> 250 managers × $99/month × 12 months = $297,000</li>
                        <li className="text-red-600"><strong>- Manager Fee Collection:</strong> 300 stores × $8,000 avg revenue × 0.02 = $48,000 (paid out to managers)</li>
                        <li><strong>+ Withdrawal Fee on Manager Collections:</strong> $48,000 × 0.029 = $1,392 (platform revenue)</li>
                        <li><strong>Managers Net Revenue:</strong> $250,392</li>
                    </ul>
    
                    <h4 className="font-bold mt-6 mb-2">Creator Withdrawal Fees</h4>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Total Creator Transaction Volume:</strong> $27,400,000
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Paid creators: $14,400,000</li>
                                <li>Free creators: $13,000,000</li>
                            </ul>
                        </li>
                        <li><strong>Platform Fees Collected:</strong> $794,600</li>
                        <li><strong>Creator Net Balance:</strong> $26,605,400</li>
                        <li><strong>Creator Withdrawal Fees:</strong> $26,605,400 × 0.029 = $771,557</li>
                    </ul>
    
                    <h4 className="font-bold mt-6 mb-2">Total Revenue Summary</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Stream</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr><td className="px-6 py-4 whitespace-nowrap">Paid Creators</td><td className="px-6 py-4 whitespace-nowrap">$2,055,216</td></tr>
                                <tr><td className="px-6 py-4 whitespace-nowrap">Free Creators</td><td className="px-6 py-4 whitespace-nowrap">$2,010,320</td></tr>
                                <tr><td className="px-6 py-4 whitespace-nowrap">Managers</td><td className="px-6 py-4 whitespace-nowrap">$250,392</td></tr>
                                <tr><td className="px-6 py-4 whitespace-nowrap">Creator Withdrawal Fees</td><td className="px-6 py-4 whitespace-nowrap">$771,557</td></tr>
                                <tr className="bg-gray-100 font-bold"><td className="px-6 py-4 whitespace-nowrap">TOTAL ANNUAL REVENUE</td><td className="px-6 py-4 whitespace-nowrap">$5,087,485</td></tr>
                            </tbody>
                        </table>
                    </div>
    
                    <h4 className="font-bold mt-6 mb-2">Key Metrics</h4>
                    <ul className="list-disc list-inside space-y-2">
                        <li><strong>Total Transaction Volume:</strong> $29,800,000
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Paid creator stores: $14,400,000</li>
                                <li>Free creators: $13,000,000</li>
                                <li>Manager-operated stores: $2,400,000</li>
                            </ul>
                        </li>
                        <li><strong>Average Revenue Per User (ARPU):</strong> $733.64</li>
                        <li><strong>Average Revenue Per Paid User:</strong> $1,141.78</li>
                        <li><strong>Platform Take Rate:</strong> 17.23% of total transaction volume</li>
                        <li><strong>Manager Economics:</strong> Managers collect $48,000 total, net $46,608 after platform withdrawal fee</li>
                    </ul>
                  </CardContent>
                </Card>
            </div>
          </section>
    
          <Section id="budget">
            <SectionTitle>Investment Requirement & Use of Funds</SectionTitle>
            <Card className="mb-8">
              <CardHeader><CardTitle>Use of Funds</CardTitle></CardHeader>
              <CardContent style={{ height: '500px' }}>
                <ResponsivePie
                  data={[
                    { id: 'Technology Development', label: 'Technology Development (30%)', value: 30, color: '#0ed60b' },
                    { id: 'API Integrations', label: 'API Integrations (5%)', value: 5, color: '#9d00ff' },
                    { id: 'Launch & Marketing', label: 'Launch & Marketing (30%)', value: 30, color: '#ff42f9' },
                    { id: 'Production Infrastructure', label: 'Production Infrastructure (10%)', value: 10, color: '#131417' },
                    { id: 'Innovation & Growth', label: 'Innovation & Growth (15%)', value: 15, color: '#00e1ed' },
                    { id: 'Personnel & Operations', label: 'Personnel & Operations (10%)', value: 10, color: '#3b3be3' },
                  ]}
                  colors={{ datum: 'data.color' }}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={(d) => {
                    const whiteTextIds = ['Production Infrastructure', 'Personnel & Operations', 'Launch & Marketing', 'API Integrations'];
                    return whiteTextIds.includes(d.id.toString()) ? 'white' : 'black';
                  }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 120,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: 'circle',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemTextColor: '#000',
                          },
                        },
                      ],
                    },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Detailed Budget Allocation</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-1 gap-6">
                  <Card>
                    <CardHeader><CardTitle>Technology Development (30%)</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Web (Complete)</li>
                        <li>iOS & Android App Development</li>
                        <li>Shopify App Development</li>
                        <li>UI/UX Design (professional design system)</li>
                        <li>React Development (store builder interface)</li>
                        <li>Mobile Development (iOS and Android apps)</li>
                        <li>Development Tools (licenses and frameworks)</li>
                        <li>Infrastructure Setup (Firebase, hosting, databases)</li>
                      </ul>
                      <p className="text-xs mt-2"><strong>Strategy:</strong> 90% of development complete. Bonus lap features, debugging, optimization. </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>API Integrations (5%)</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Print-on-Demand (Printful, Gooten integration)</li>
                        <li>Dropshipping (AliExpress, Amazon APIs)</li>
                        <li>AI Services (OpenAI, Gemini, Meshy)</li>
                        <li>Payment Processing (Stripe Connect)</li>
                        <li>Content Creation (Shotstack, Creatomate)</li>
                        <li>Supporting Services (email, monitoring, analytics)</li>
                      </ul>
                      <p className="text-xs mt-2"><strong>Strategy:</strong> Best-in-class integrations for comprehensive automation and a reliable user experience</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Launch & Marketing (30%)</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Creator Launch Program (resources & incentives for early users, driving traffic to their stores as well as FF)</li>
                        <li>Digital Advertising (Meta, Google, TikTok, YouTube)</li>
                        <li>Platform-Specific Marketing (LinkedIn, X (Twitter)</li>
                        <li>Shopify Ads reaching merchants directly on Shopify</li>
                        <li>Facebook/Instagram Ads targeting merchants with Subscription Pixel</li>
                        <li>TikTok Ads targeting Shops with Subscription Pixel</li>
                        <li>Google (App Campaigns) & YouTube Ads with Subscription Pixel</li>
                        <li>Apple App Store and Google Play Store Ads</li>
                      </ul>
                      <p className="text-xs mt-2"><strong>Strategy:</strong> Aggressive customer acquisition during critical launch window</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Production Infrastructure (10%)</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Hosting & Storage (production-grade infrastructure)</li>
                        <li>Database Systems (scalable data management)</li>
                        <li>API Costs (production-level integrations)</li>
                      </ul>
                      <p className="text-xs mt-2"><strong>Strategy:</strong> Reliable & Scalable infrastructure ready for rapid user growth, leveraging Google Cloud for efficient hosting, storage, database, and API management.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Innovation & Growth (15%)</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>Ongoing Development (templates, features, optimization)</li>
                        <li>Quality Assurance (testing tools and services)</li>
                        <li>Continuous Marketing (ongoing ad spend)</li>
                        <li>Content Creation (generative AI, educational and marketing content)</li>
                      </ul>
                      <h4 className="font-bold mt-4">Updates</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li>Instagram</li>
                        <li>TikTok</li>
                        <li>Substack</li>
                        <li>Twitter</li>
                        <li>Emails</li>
                        <li>LinkedIn</li>
                      </ul>
                      <p className="text-xs mt-2"><strong>Strategy:</strong> Continuous improvement and market expansion</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Personnel & Operations (10%)</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>CFO</li>
                        <li>General Admin (legal, accounting, business setup)</li>
                        <li>Security & Compliance (professional audits)</li>
                      </ul>
                      <p className="text-xs mt-2"><strong>Strategy:</strong> Lean team structure with founder experience handling core development with AI coding agent acceleration, minimal overhead burn</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </Section>
    
          <Section id="risk">
            <SectionTitle>Risk Analysis & Mitigation</SectionTitle>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader><CardTitle>Technology Risks</CardTitle></CardHeader>
                <CardContent>
                  <h4 className="font-bold">AI Model Dependencies</h4>
                  <p><strong>Risk:</strong> Reliance on third-party AI services</p>
                  <p><strong>Mitigation:</strong> Multi-provider strategy with fallbacks in place, proprietary model development</p>
                  <p><strong>Timeline:</strong> Custom models in development by Month 18 trained with human data & recursive self improvement</p>
                  <h4 className="font-bold mt-4">Scalability Challenges</h4>
                  <p><strong>Risk:</strong> Infrastructure limitations during rapid growth</p>
                  <p><strong>Mitigation:</strong> Rate limited generation, cloud-native architecture, reliable scaling systems (Google Cloud)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Market Risks</CardTitle></CardHeader>
                <CardContent>
                  <h4 className="font-bold">Competition from Established Players</h4>
                  <p><strong>Risk:</strong> Shopify or others launch competing AI features</p>
                  <p><strong>Mitigation:</strong> First-mover advantage, superior AI integration, features and user experience</p>
                  <p><strong>Competitive Moat:</strong> Non-replicable, intricate background processes with seamless user experience</p>
                  <h4 className="font-bold mt-4">Ethical AI Considerations</h4>
                  <p><strong>Risk:</strong> Algorithmic bias, data privacy concerns, and lack of transparency in AI-driven marketing.</p>
                  <p><strong>Mitigation:</strong> Train and continuously audit our algorithms for bias, provide users with clear data usage policies, and ensure compliance with privacy regulations.</p>
                  <h4 className="font-bold mt-4">Creator Market Saturation</h4>
                  <p><strong>Risk:</strong> Limited pool of potential creators ready for stores</p>
                  <p><strong>Mitigation:</strong> Influencer Marketing, Low barrier to entry, Business & marketing tutorial content, Quality over quantity (targeting both businesses/merchants and creators not yet monetized)</p>
                  <p><strong>Market Size:</strong> 50M+ addressable creators globally</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Operational Risks</CardTitle></CardHeader>
                <CardContent>
                  <h4 className="font-bold">Fulfillment Partner Dependencies</h4>
                  <p><strong>Risk:</strong> Print on Demand supplier change terms or fail</p>
                  <p><strong>Mitigation:</strong> Use alternatives such as Printful and have arrangements in place for in-house POD fulfillment.</p>
                  <p><strong>Contingency:</strong> Budget includes the highest provider integration cost (fallback are more cost effective )</p>
                  <h4 className="font-bold mt-4">Regulatory Changes</h4>
                  <p><strong>Risk:</strong> Ecommerce, AI, or payment regulations impact operations</p>
                  <p><strong>Mitigation:</strong> Compliance-first approach, legal budget allocation, AI system instruction filters, robust Stripe integrations</p>
                  <p><strong>Monitoring:</strong> Continuous regulatory tracking and adaptation with 4 step approach (review, learn, apply, comply)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Financial Risks</CardTitle></CardHeader>
                <CardContent>
                  <h4 className="font-bold">Customer Acquisition Costs</h4>
                  <p><strong>Risk:</strong> Rising ad costs reduce unit economics</p>
                  <p><strong>Mitigation:</strong> Diversified marketing channels, Organic growth, Lookalike audiences & pixel based marketing (lower cost per conv.), better ad creatives and strategies</p>
                  <p><strong>Buffer:</strong> 30% marketing budget provides testing room during ad optimization & pixel warm up to find winning ads / configurations</p>
                  <h4 className="font-bold mt-4">Revenue Concentration</h4>
                  <p><strong>Risk:</strong> Over-dependence on single revenue stream</p>
                  <p><strong>Mitigation:</strong> Multiple revenue sources (manager & creator subscriptions & fees), predictable & reliable revenue systems (ecosystem built on stripe), sustainable economy with multiple roles transacting</p>
                  <p><strong>Diversification:</strong> 4 distinct revenue streams at launch</p>
                </CardContent>
              </Card>
            </div>
          </Section>
    
          <Section id="technology">
            <SectionTitle>Technology & Intellectual Property</SectionTitle>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader><CardTitle>Proprietary Technology Assets</CardTitle></CardHeader>
                <CardContent>
                  <h4 className="font-bold">Core Algorithms</h4>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>POD Designs: Layered API calls that result in professional designs visualized on a large variety of print on demand products</li>
                    <li>Store Template Generation: Automated code generation of store templates based on store prompt, niche analysis & more</li>
                    <li>Multi-Modal Content Creation: Integrated text, image, and video generation with unique gene/attribute tag system</li>
                    <li>Conversion Optimization: Built in variant and product visualizer, 3D AR viewer, and realtime AI chat assistant with function calling and MCP integration.</li>
                    <li>Magic Marketing Packages: AI system that generates converting ad copies using realtime search APIs and Agents SDK for live market data.</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Data & Training Assets</CardTitle></CardHeader>
                <CardContent>
                  <h4 className="font-bold">Proprietary Datasets</h4>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>E-commerce Performance Data: Pixel heat maps, store conversion and sales optimization</li>
                    <li>Marketing Data: Ad campaign results across niches, design trends from Manager to Creator campaigns<a href="mailto:"></a>nd products</li>
                    <li>Creator Behavior: User persona demographics, origin, interaction and success pattern analysis</li>
                    <li>Market Intelligence: Social commerce trend prediction and market demand forecasting</li>
                  </ul>
                  <h4 className="font-bold mt-4">Competitive Intelligence</h4>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li><strong>Technology Moat:</strong> Irreducible level of simplicity with one prompt achieving full store generation in under 3 minutes with efficient use of flash models</li>
                    <li><strong>Cross-beneficial:</strong> Creator generates store with AI, Managers promotes Creators products, Customer gets the product, Creators get the sale, Managers get the fee</li>
                    <li><strong>Data Advantage:</strong> AI interactions are studied (by another AI) to improve the platform, whether it's a Customer visualizing a product, a Manager creating social media content or a Creator making updates to their store</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </Section>
    
          <Section id="marketing-growth">
            <SectionTitle>Marketing & Growth Strategy</SectionTitle>
            <div className="space-y-8">
              <Card>
                <CardHeader><CardTitle>Go-to-Market Strategy</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-bold">Phase 1: Creator Launch Program (Months 1-6)</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li><strong>Target:</strong> 20 creators/influencers</li>
                        <li><strong>Investment:</strong> $20,000 in incentives and support to 20 Creators earning min. $20k revenue in exchange for posts.</li>
                        <li><strong>Focus:</strong> Product-market fit validation, traffic and testimonials</li>
                        <li><strong>Success Metrics:</strong> Creator satisfaction & brand trust, Increased users & monthly revenue</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold">Phase 2: Paid Acquisition Scale (Months 6-18)</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li><strong>Investment:</strong> 30% of budget dedicated to digital advertising</li>
                        <li><strong>Channels:</strong> Meta (FB/Instagram), Google, TikTok, YouTube, X, Apple App Store/Google Play Store, Shopify Marketplace ads</li>
                        <li><strong>Target:</strong> 1,000 active creators by Month 12</li>
                        <li><strong>Success Metrics:</strong> CAC under $15, LTV/CAC ratio above 50:1</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold">Phase 3: Viral Growth & Network Effects (Months 18+)</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                        <li><strong>Strategy:</strong> Creator referral programs, manager network expansion</li>
                        <li><strong>Investment:</strong> Stabilized paid acquisition, shift gears to loyalty/retention for reliance testing</li>
                        <li><strong>Target:</strong> 50%+ growth from organic channels</li>
                        <li><strong>Success Metrics:</strong> Viral coefficient above 1.2</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader><CardTitle>Marketing Channel Strategy</CardTitle></CardHeader>
                  <CardContent>
                    <h4 className="font-bold">Digital Advertising Allocation</h4>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Shopify Ads reaching merchants directly on Shopify</li>
                      <li>Facebook/Instagram Ads targeting merchants with Subscription Pixel</li>
                      <li>TikTok Ads targeting Shops with Subscription Pixel</li>
                      <li>Google (App Campaigns) & YouTube Ads with Subscription Pixel</li>
                      <li>Apple App Store and Google Play Store Ads</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Content Marketing Strategy</CardTitle></CardHeader>
                  <CardContent>
                    <h4 className="font-bold">Content Marketing Strategy</h4>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Educational Content: Tutorials, webinars, business & marketing advice</li>
                      <li>SEO Strategy: Long-tail keyword targeting for creator searches (Google Merchant / Shopping Tabs/Results / Creators FF Product Page)</li>
                      <li>Social Media: Showcase creator success stories, customer testimonials and platform features</li>
                      <li>Influencer Partnerships: Collaborate with creator economy influencers</li>
                    </ul>
                    <h4 className="font-bold mt-4">Quick Updates</h4>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Instagram (Posts/reels)</li>
                      <li>TikTok (Videos)</li>
                      <li>Substack (Posts)</li>
                      <li>X/Twitter (Posts/Spaces)</li>
                      <li>Emails (Newsletter)</li>
                      <li>YouTube (Shorts)</li> 
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Google App Campaigns</CardTitle></CardHeader>
                  <CardContent>
                    <p>App campaigns can help you promote your apps across Google’s largest properties including Search, Google Play, YouTube, Discover on Google Search, and the Google Display Network.</p>
                    <h4 className="font-bold mt-4">Benefits</h4>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Holistic setup: Unified data & ad optimization across networks and formats. (App Store, Google Search, Gmail, YouTube etc.) </li>
                      <li>Automated optimization: Google Ads will test different ad combinations and serve the best-performing ads.</li>
                      <li>Google partners: Your ads can appear across multiple Google partner networks, reaching a larger potential user base.</li>
                      <li>Focus on conversions: You can optimize your campaigns to drive specific actions, such as app installs or in-app purchases.</li>
                      <li>Effortless performance tracking: You can check how your campaigns are performing and make adjustments as needed.</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Apple App Stores Ads</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Drives app discovery and downloads on the App Store, with over 650 million weekly visitors.</li>
                      <li>Highly effective, with conversion rates over 60% for search results ads.</li>
                      <li>95% of downloads happen within a minute of an ad tap.</li>
                      <li>Various ad placements are available across the App Store to maximize visibility, including the Today Tab, Search Tab, Search Results, and Product Pages.</li>
                      <li>Campaign management features include flexible creative options with custom product pages, deep links, built-in optimization, and a cost-per-tap (CPT) pricing model.</li>
                      <li>For measurement, Apple Ads offers at-a-glance results, personalized keyword and bid recommendations, powerful analytics via Insights, and comprehensive API solutions.</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Instagram Ads</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Instagram Ads ran through Facebook with pixel optimization for in-app subscriptions.</li>
                      <li>Partnering with Creators to launch FreshFront campaigns for their Products/Merch on the Instagram Creator Marketplace.</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Shopify Ads</CardTitle></CardHeader>
                  <CardContent>
                    <p>Detailed targeting to 25+ million merchants on Shopify</p>
                    <h4 className="font-bold mt-4">Ad Types & Placements</h4>
                    <p>Shopify offers three main ad types:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Search results: Appear when merchants search for relevant terms.</li>
                      <li>Category and subcategory pages: Display within specific app categories.</li>
                      <li>Homepage: Featured on the Shopify App Store's main page</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Section>
    
          <Section id="investment-terms">
            <SectionTitle>Investment Terms & Next Steps</SectionTitle>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader><CardTitle>Proposed Investment Structure</CardTitle></CardHeader>
                <CardContent>
                  <h4 className="font-bold">Investment</h4>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li><strong>Stage:</strong> Seed</li>
                    <li><strong>Investment Type:</strong> SAFE / Convertible Note</li>
                  </ul>
                  <h4 className="font-bold mt-4">Investor Benefits</h4>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Dashboard: Intuitive application experience to manage your investment</li>
                    <li>Board Observer Rights: Quarterly reporting and strategic input</li>
                    <li>Pro-Rata Rights: Participation in future funding rounds</li>
                    <li>Information Rights: Monthly financial and operational updates</li>
                    <li>Advisory Role: Direct input on strategic decisions</li>
                    <li>Free Access to Manger Plan: Earn fees from our Creator economy</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Contact Information & Next Steps</CardTitle></CardHeader>
                <CardContent>
                  <p>For additional information, technical demonstrations, or to begin the due diligence process, please contact:</p>
                  <p className="font-bold my-2">FreshFront Contact Info</p>
                  <p>Email: info@freshfront.co</p>
                  <p>Phone: 647-615-2293</p>
                  <p>Website: www.freshfront.co</p>
                  <p>Demo Portal: freshfront.co</p>
                </CardContent>
              </Card>
            </div>
          </Section>
        </div>
      );
}

const InfoPage = () => {
  const [showInvestorPackage, setShowInvestorPackage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      setShowInvestorPackage(true);
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'Fresh25') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const MatrixEffect = () => {
    const canvasRef = React.useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const letters = 'FRESHFRONT'.split('');
      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize);
      const drops = Array(columns).fill(1);

      function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0f0';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = letters[Math.floor(Math.random() * letters.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }

      const interval = setInterval(draw, 33);
      return () => clearInterval(interval);
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
  };

  const renderContent = () => {
    if (showInvestorPackage) {
      if (!isAuthenticated) {
        return (
          <div className="relative flex items-center justify-center h-screen bg-black font-mono text-green-400" style={{ fontFamily: '"Lucida Console", monospace' }}>
            <MatrixEffect />
            <div className="relative z-10 w-full max-w-2xl p-8 border-2 border-green-400 rounded-lg bg-black/50 backdrop-blur-sm">
              <div className="animate-pulse text-center text-lg mb-4">FreshFront Investor Portal</div>
              <p className="mb-2"> Access is restricted...</p>
              <p className="mb-4"> Please provide credentials.</p>
              <form onSubmit={handlePasswordSubmit} className="flex items-center">
                <label htmlFor="password-input" className="mr-2"> Enter Password:</label>
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-grow bg-transparent border-none focus:ring-0 text-green-400"
                  autoFocus
                />
                <span className="w-2 h-5 bg-green-400 animate-blink"></span>
              </form>
              {error && <p className="text-red-500 text-sm mt-4"> {error}</p>}
            </div>
            <style>{`
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
              }
              .animate-blink {
                animation: blink 1s step-end infinite;
              }
            `}</style>
          </div>
        );
      }
      return <InvestorPackage />;
    }
    return <HomePage />;
  };

  return (
    <div>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowInvestorPackage(!showInvestorPackage)}
          className="dark:text-black"
        >
          {showInvestorPackage ? 'Show Public View' : 'Show Investor View'}
        </Button>
      </div>
      {renderContent()}
    </div>
  );
};

export default InfoPage;
