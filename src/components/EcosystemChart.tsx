import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import mermaid from 'mermaid';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X } from 'lucide-react';

const nodeDetails: { [key: string]: { title: string; description: string } } = {
  A: { title: 'Creator Signs Up', description: 'Artists, designers, and entrepreneurs begin their journey by creating a FreshFront account.' },
  C: { title: 'Direct Onboarding', description: 'Creators can sign up directly through the FreshFront website to start building their store.' },
  D: { title: 'Manager Affiliate', description: 'Creators can also be onboarded via a unique affiliate link from a registered Manager.' },
  F: { title: 'Subscription', description: 'A $29.99/month subscription gives creators access to the full suite of AI-powered tools.' },
  E: { title: 'Stripe Connect', description: 'Creators connect their bank accounts via Stripe for secure payment processing and payouts.' },
  G: { title: 'Store Dashboard', description: 'The central hub for creating, managing, and monitoring all e-commerce activities.' },
  M1: { title: 'Manager Signup', description: 'Service providers join the platform to manage creators and earn revenue.' },
  M2: { title: 'ID Verification', description: 'All managers undergo a verification process to ensure platform security.' },
  M3: { title: 'Manager Subscription', description: 'A $99/month subscription unlocks advanced multi-creator management tools.' },
  M4: { title: 'Stripe Setup', description: 'Managers set up a Stripe Connect account to handle revenue sharing and fees.' },
  M5: { title: 'Affiliate Link', description: 'Managers receive a unique link to onboard new creators to their portfolio.' },
  UP: { title: 'User Prompt Mode', description: 'The fastest way to create a store by providing a simple text prompt.' },
  SBS: { title: 'Step-by-Step Mode', description: 'A guided process for detailed customization of the store.' },
  IMP: { title: 'Import Mode', description: 'Migrate an existing store from another platform like Shopify or Etsy.' },
  UP1: { title: 'Enter Store Name & Description', description: 'Provide a name and a brief description for the store to kickstart the AI process.' },
  UP3: { title: 'Upload Product Photos', description: 'For inventory-based stores, upload photos of your products.' },
  UP4: { title: 'Enter Design Prompt', description: 'For print-on-demand stores, describe the design you want the AI to create.' },
  UP5: { title: 'Search Products', description: 'For dropshipping, search for products from integrated suppliers like AliExpress.' },
  UP6: { title: 'AI Analyzes Photos', description: 'Gemini AI analyzes product photos for identification, categorization, and quality assessment.' },
  UP7: { title: 'Finalize Products Modal', description: 'Review and edit AI-generated product details, variants, and bundles.' },
  UP8: { title: 'AI Generates Designs', description: 'The AI creates multiple design variations based on the text prompt.' },
  UP9: { title: 'Finalize Designs', description: 'Review, edit, and select the generated designs to apply to products.' },
  UP10: { title: 'Review Mockups', description: 'Visualize the designs on product mockups and lifestyle images.' },
  UP11: { title: 'AI Price Analysis', description: 'The AI provides a profit calculator with suggested pricing based on market analysis.' },
  UP12: { title: 'Select & Edit Products', description: 'Customize product titles, descriptions, and images before adding them to the store.' },
  SBS1: { title: 'Step 1: Niche', description: 'Select an e-commerce vertical, with AI suggestions for trending niches.' },
  SBS2: { title: 'Step 2: Store Name', description: 'Enter a store name manually or get AI-generated suggestions.' },
  SBS3: { title: 'Step 3: Logo', description: 'Upload an existing logo or use the AI to generate one in dark and light modes.' },
  SBS5: { title: 'Step 5: Products', description: 'Add products by uploading photos, generating designs, or searching dropshipping suppliers.' },
  SBS6: { title: 'Step 6: Collections', description: 'Organize products into collections, either manually or with AI assistance.' },
  SBS7: { title: 'Step 7: Finishing Touches', description: 'Apply final AI-driven enhancements based on a desired store personality.' },
  IMP1: { title: 'Select Source', description: 'Choose the platform to import from (e.g., Shopify, Etsy, BigCommerce).' },
  IMP2: { title: 'Enter API Key', description: 'Provide the necessary API credentials to connect to the source platform.' },
  IMP3: { title: 'Select Items', description: 'Choose which data to import, such as products, collections, and branding.' },
  IMP4: { title: 'Review & Finalize', description: 'Preview the imported data and resolve any conflicts before finalizing the migration.' },
  STORE_GEN: { title: 'AI Store Generation', description: 'The AI automatically generates all necessary assets for the store, including logos, content, and ad creatives.' },
  SG1: { title: 'Logos, Collections, Code', description: 'The AI creates branding assets, organizes products, and generates the underlying store code.' },
  SG2: { title: 'Site Content', description: 'All website copy, product descriptions, and SEO content are generated automatically.' },
  SG3: { title: 'Ad Creatives', description: 'The platform produces image and video ads ready for marketing campaigns.' },
  LIVE: { title: 'Live Store Created', description: 'The fully-functional e-commerce store is published and ready for customers.' },
  CUST1: { title: 'Customer Visits Store', description: 'A potential customer arrives at the newly created online store.' },
  CUST2: { title: 'AI Customer Features', description: 'The customer interacts with AI-powered tools like search, visualization, and support.' },
  PURCHASE: { title: 'Customer Makes Purchase', description: 'A customer finds a product and completes a transaction through the secure Stripe checkout.' },
  PAY1: { title: 'Stripe Checkout', description: 'Payment is securely processed via Stripe, handling all transaction details.' },
  ORDER1: { title: 'Order to Gooten API', description: 'The order is automatically sent to the Gooten API for fulfillment.' },
  FULFILL: { title: 'Fulfillment & Delivery', description: 'Gooten handles the print-on-demand production, quality control, and shipping.' },
  MGR_H: { title: 'Manager to Gooten', description: 'If the creator has a manager, the manager handles any fulfillment issues with Gooten.' },
  FF_H: { title: 'Creator to FreshFront', description: 'If the creator is direct, FreshFront support assists with any fulfillment issues.' },
  REV1: { title: 'Manager/FreshFront Revenue', description: 'Transaction fees are automatically distributed to the Manager (if applicable) and FreshFront.' },
  REV2: { title: 'Manager Subscription Revenue', description: 'FreshFront collects a monthly subscription fee from managers.' },
  REV3: { title: 'Creator Subscription Revenue', description: 'FreshFront collects a monthly subscription fee from creators who are not under a manager.' },
  DASH: { title: 'Integrated Dashboards', description: 'Both creators and managers have access to dashboards to monitor their business.' },
  CD: { title: 'Creator Dashboard', description: 'Creators can track their sales, manage products, and view analytics.' },
  MD: { title: 'Manager Dashboard', description: 'Managers can oversee their portfolio of creators, track revenue, and access marketing tools.' },
  CREATOR_AI: { title: 'AI Features for Creators', description: 'A suite of AI tools designed to help creators build and manage their stores efficiently.' },
  CAI1: { title: 'Store, Design & Product Generation', description: 'AI tools for creating all aspects of the store from scratch.' },
  CAI2: { title: 'AI Site & Product Editing', description: 'Edit and enhance the store’s appearance and product details with AI assistance.' },
  CAI3: { title: 'AI Content Creation Studio', description: 'A suite of tools for generating marketing copy, blog posts, and other content.' },
  CAI4: { title: 'AI Product Discovery Insights', description: 'Get AI-driven insights into trending products and market opportunities.' },
  MANAGER_AI: { title: 'AI Features for Managers', description: 'Tools designed to help managers scale their operations and automate tasks.' },
  MAI1: { title: 'Automated Content Creation', description: 'Managers can automate content creation across multiple creator stores.' },
  MAI2: { title: 'Automated Marketing Campaigns', description: 'Launch and manage marketing campaigns for multiple stores simultaneously.' },
  CUSTOMER_AI: { title: 'AI Features for Customers', description: 'Features that enhance the shopping experience through personalization and support.' },
  CUAI1: { title: 'Variant & Product Visualizer', description: 'Customers can see products in different variations and contexts.' },
  CUAI2: { title: 'Realtime Support Assistant', description: 'An AI-powered chatbot to assist customers with their queries in real-time.' },
  CUAI3: { title: 'Personalization', description: 'The shopping experience is personalized based on customer behavior and preferences.' },
  MR1: { title: 'Market Research with Google Search and Web Scraping', description: 'Leverage AI to perform market research using Google Search and web scraping to identify trends, competition, and target audience.' },
};

const EcosystemChart: React.FC<{ setSelectedNode: (node: { title: string; description: string } | null) => void }> = ({ setSelectedNode }) => {
  const mermaidChart = `
    graph TD
        subgraph "Creator Onboarding"
            A[Creator Signs Up] --> B{Onboarding Path}
            B -->|Direct| C[Direct FreshFront Onboarding]
            B -->|Via Manager| D[Manager Affiliate Link]
            C --> F[Subscribe $29.99/mo]
            F --> E[Stripe Connect Setup]
            D --> E
            E --> G[Store Creation Dashboard]
        end

        subgraph "Manager Onboarding"
            M1[Manager Signup] --> M2[ID Verification]
            M2 --> M3[Subscribe $99/mo]
            M3 --> M4[Stripe Connect Account Setup]
            M4 --> M5[Get Affiliate Link]
            M5 --> D
        end

        subgraph "Store Creation Modes"
            G --> MODE{Select Creation Mode}
            MODE -->|User Prompt| UP[User Prompt]
            MODE -->|Step-by-Step| SBS[Step-by-Step]
            MODE -->|Import| IMP[Import]
        end

        subgraph "User Prompt Mode"
            UP --> UP1[Enter Store Name & Description]
            UP1 --> MR1[Market Research]
            MR1 --> UP2{Store Type Check}
            UP2 -->|Inventory| UP3[Upload Product Photos]
            UP2 -->|Print on Demand| UP4[Enter Design Prompt]
            UP2 -->|Dropshipping| UP5[Search Products]
            UP3 --> UP6[AI Analyzes Photos]
            UP6 --> UP7[Finalize Products Modal]
            UP7 --> STORE_GEN
            UP4 --> UP8[AI Generates Designs]
            UP8 --> UP9[Finalize Designs]
            UP9 --> UP10[Review Mockups]
            UP10 --> STORE_GEN
            UP5 --> UP11[AI Price Analysis]
            UP11 --> UP12[Select & Edit Products]
            UP12 --> STORE_GEN
        end

        subgraph "Step-by-Step Mode"
            SBS --> SBS1[Step 1: Niche]
            SBS1 --> SBS2[Step 2: Store Name]
            SBS2 --> SBS3[Step 3: Logo]
            SBS3 --> MR1
            MR1 --> SBS4{Step 4: Store Type}
            SBS4 -->|Inventory| SBS4_1[Upload Photos]
            SBS4 -->|Print on Demand| SBS4_2[Generate Designs]
            SBS4 -->|Dropshipping| SBS4_3[Search Products]
            SBS4_1 --> SBS5[Step 5: Products]
            SBS4_2 --> SBS5
            SBS4_3 --> SBS5
            SBS5 --> SBS6[Step 6: Collections]
            SBS6 --> SBS7[Step 7: Finishing Touches]
            SBS7 --> STORE_GEN
        end

        subgraph "Import Mode"
            IMP --> IMP1[Select Source]
            IMP1 --> IMP2[Enter API Key]
            IMP2 --> IMP3[Select Items]
            IMP3 --> IMP4[Review & Finalize]
            IMP4 --> STORE_GEN
        end

        subgraph "AI-Powered Features"
            subgraph "For Creators"
                CREATOR_AI[AI Features] --> CAI1[Store, Design & Product Generation]
                CREATOR_AI --> CAI2[AI Site & Product Editing]
                CREATOR_AI --> CAI3[AI Content Creation Studio]
                CREATOR_AI --> CAI4[AI Product Discovery Insights]
            end
            subgraph "For Managers"
                MANAGER_AI[AI Features] --> MAI1[Automated Content Creation]
                MANAGER_AI --> MAI2[Automated Marketing Campaigns]
            end
            subgraph "For Customers"
                CUSTOMER_AI[AI Features] --> CUAI1[Variant & Product Visualizer]
                CUSTOMER_AI --> CUAI2[Realtime Support Assistant]
                CUSTOMER_AI --> CUAI3[Personalization]
            end
        end

        subgraph "AI Store Generation"
            STORE_GEN[AI Store Generation] --> SG1[Logos, Collections, Code]
            SG1 --> SG2[Site Content]
            SG2 --> SG3[Ad Creatives]
            SG3 --> LIVE[Live Store Created]
        end

        subgraph "Customer & Fulfillment"
            LIVE --> CUST1[Customer Visits Store]
            CUST1 --> CUST2[AI Customer Features]
            CUST2 --> PURCHASE[Customer Makes Purchase]
            PURCHASE --> PAY1[Stripe Checkout]
            PAY1 --> ORDER1[Order to Gooten API]
            ORDER1 --> FULFILL[Fulfillment & Delivery]
            FULFILL -->|Issue| RESOLVE{Resolution Path}
            RESOLVE -->|Manager| MGR_H[Manager to Gooten]
            RESOLVE -->|Direct| FF_H[Creator to FreshFront]
        end

        subgraph "Revenue & Management"
            PAY1 -->|Fee| REV1[Manager/FreshFront Revenue]
            M3 --> REV2[Manager Subscription Revenue]
            F --> REV3[Creator Subscription Revenue]
            FULFILL --> DASH[Integrated Dashboards]
            DASH -->|Creator| CD[Creator Dashboard]
            DASH -->|Manager| MD[Manager Dashboard]
        end

        classDef default font-size:20px,padding:10px
        classDef creator fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
        classDef manager fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;
        classDef customer fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px;
        classDef ai fill:#fff3e0,stroke:#e65100,stroke-width:2px;
        classDef platform fill:#f0f4c3,stroke:#33691e,stroke-width:2px;

        class A,C,E,F,G,CD,CAI1,CAI2,CAI3,CAI4,REV3 creator;
        class M1,M2,M3,M4,M5,MGR_H,MD,MAI1,MAI2,REV2 manager;
        class CUST1,CUST2,PURCHASE,CUAI1,CUAI2,CUAI3 customer;
        class UP6,UP8,UP11,STORE_GEN,SG1,SG2,SG3,CREATOR_AI,MANAGER_AI,CUSTOMER_AI,MR1 ai;
        class B,D,MODE,UP,UP1,UP2,UP3,UP4,UP5,UP7,UP9,UP10,UP12,SBS,SBS1,SBS2,SBS3,SBS4,SBS4_1,SBS4_2,SBS4_3,SBS5,SBS6,SBS7,IMP,IMP1,IMP2,IMP3,IMP4,LIVE,PAY1,ORDER1,FULFILL,RESOLVE,FF_H,REV1,DASH platform;

        click A call handleNodeClick("A")
        click C call handleNodeClick("C")
        click D call handleNodeClick("D")
        click F call handleNodeClick("F")
        click E call handleNodeClick("E")
        click G call handleNodeClick("G")
        click M1 call handleNodeClick("M1")
        click M2 call handleNodeClick("M2")
        click M3 call handleNodeClick("M3")
        click M4 call handleNodeClick("M4")
        click M5 call handleNodeClick("M5")
        click MR1 call handleNodeClick("MR1")
        click UP call handleNodeClick("UP")
        click SBS call handleNodeClick("SBS")
        click IMP call handleNodeClick("IMP")
        click UP1 call handleNodeClick("UP1")
        click UP3 call handleNodeClick("UP3")
        click UP4 call handleNodeClick("UP4")
        click UP5 call handleNodeClick("UP5")
        click UP6 call handleNodeClick("UP6")
        click UP7 call handleNodeClick("UP7")
        click UP8 call handleNodeClick("UP8")
        click UP9 call handleNodeClick("UP9")
        click UP10 call handleNodeClick("UP10")
        click UP11 call handleNodeClick("UP11")
        click UP12 call handleNodeClick("UP12")
        click SBS1 call handleNodeClick("SBS1")
        click SBS2 call handleNodeClick("SBS2")
        click SBS3 call handleNodeClick("SBS3")
        click SBS5 call handleNodeClick("SBS5")
        click SBS6 call handleNodeClick("SBS6")
        click SBS7 call handleNodeClick("SBS7")
        click IMP1 call handleNodeClick("IMP1")
        click IMP2 call handleNodeClick("IMP2")
        click IMP3 call handleNodeClick("IMP3")
        click IMP4 call handleNodeClick("IMP4")
        click CREATOR_AI call handleNodeClick("CREATOR_AI")
        click CAI1 call handleNodeClick("CAI1")
        click CAI2 call handleNodeClick("CAI2")
        click CAI3 call handleNodeClick("CAI3")
        click CAI4 call handleNodeClick("CAI4")
        click MANAGER_AI call handleNodeClick("MANAGER_AI")
        click MAI1 call handleNodeClick("MAI1")
        click MAI2 call handleNodeClick("MAI2")
        click CUSTOMER_AI call handleNodeClick("CUSTOMER_AI")
        click CUAI1 call handleNodeClick("CUAI1")
        click CUAI2 call handleNodeClick("CUAI2")
        click CUAI3 call handleNodeClick("CUAI3")
        click STORE_GEN call handleNodeClick("STORE_GEN")
        click SG1 call handleNodeClick("SG1")
        click SG2 call handleNodeClick("SG2")
        click SG3 call handleNodeClick("SG3")
        click LIVE call handleNodeClick("LIVE")
        click CUST1 call handleNodeClick("CUST1")
        click CUST2 call handleNodeClick("CUST2")
        click PURCHASE call handleNodeClick("PURCHASE")
        click PAY1 call handleNodeClick("PAY1")
        click ORDER1 call handleNodeClick("ORDER1")
        click FULFILL call handleNodeClick("FULFILL")
        click MGR_H call handleNodeClick("MGR_H")
        click FF_H call handleNodeClick("FF_H")
        click REV1 call handleNodeClick("REV1")
        click REV2 call handleNodeClick("REV2")
        click REV3 call handleNodeClick("REV3")
        click DASH call handleNodeClick("DASH")
        click CD call handleNodeClick("CD")
        click MD call handleNodeClick("MD")
  `;

  useEffect(() => {
    (window as any).handleNodeClick = (nodeId: string) => {
      if (nodeDetails[nodeId]) {
        setSelectedNode(nodeDetails[nodeId]);
      }
    };

    mermaid.initialize({ startOnLoad: true, theme: 'default', securityLevel: 'loose' });
    mermaid.run();
  }, [setSelectedNode]);

  return (
    <div className="relative w-full bg-[#EFF6FF] dark:from-gray-900 dark:via-slate-800 dark:to-blue-900 overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="mermaid">{mermaidChart}</div>
      </div>
    </div>
  );
};

export default EcosystemChart;
