import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

interface IntegrationStepProps {
  number: number;
  title: string;
  description: string;
}

const IntegrationStep = ({
  number,
  title,
  description,
}: IntegrationStepProps) => {
  return (
    <div className="flex items-start gap-4 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
        {number}
      </div>
      <div>
        <h4 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
          {title}
        </h4>
        <p className="text-muted-foreground dark:text-gray-300">
          {description}
        </p>
      </div>
    </div>
  );
};

interface PlatformBenefitProps {
  text: string;
}

const PlatformBenefit = ({ text }: PlatformBenefitProps) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
      <span className="text-gray-700 dark:text-gray-300">{text}</span>
    </div>
  );
};

const IntegrationSection = () => {
  return (
    <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-gray-50 via-slate-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-500 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-cyan-300 dark:bg-cyan-500 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-cyan-800 dark:from-white dark:to-cyan-200 bg-clip-text text-transparent">
            Import Your Existing Store
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Seamlessly migrate your products and data from popular e-commerce
            platforms
          </p>
        </motion.div>

        <Tabs defaultValue="shopify" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger
                value="shopify"
                className="flex items-center justify-center gap-2"
              >
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/Shopifylogo.PNG?alt=media&token=66a3c796-5618-474a-b45a-8d3b14e2ff1d"
                  alt="Shopify Logo"
                  className="h-6 w-auto -mt-2"
                />
              </TabsTrigger>
              <TabsTrigger
                value="bigcommerce"
                className="flex items-center justify-center gap-2"
              >
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/Bigcommerce.WEBP?alt=media&token=9199a87b-9426-487f-ac89-e3412598d137"
                  alt="BigCommerce Logo"
                  className="h-8 w-auto -mt-2"
                />
              </TabsTrigger>
              <TabsTrigger
                value="etsy"
                className="flex items-center justify-center gap-2"
              >
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/IMG_6560.png?alt=media&token=4d235f5d-6a8c-4c62-9039-ac6121097424"
                  alt="Etsy Logo"
                  className="h-6 w-auto"
                />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="shopify" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-white/90 dark:bg-gray-800 backdrop-blur-sm shadow-xl border-0">
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                      Import Process
                    </h3>
                    <IntegrationStep
                      number={1}
                      title="Connect Your Shopify Store"
                      description="Authorize FreshFront to access your Shopify store data securely."
                    />
                    <IntegrationStep
                      number={2}
                      title="Select What to Import"
                      description="Choose which products, collections, and store details you want to bring over."
                    />
                    <IntegrationStep
                      number={3}
                      title="Review and Confirm"
                      description="Preview how your imported data will look in FreshFront before finalizing."
                    />
                    <Button
                      className="mt-4 w-full text-black"
                      onClick={() =>
                        window.open("https://freshfront.co", "_blank")
                      }
                    >
                      Connect Shopify Store{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-white/90 dark:bg-gray-800 backdrop-blur-sm shadow-xl border-0">
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                      Benefits
                    </h3>
                    <PlatformBenefit text="Import all products with images, descriptions, and variants" />
                    <PlatformBenefit text="Transfer collections and categories structure" />
                    <PlatformBenefit text="Bring over store branding and basic settings" />
                    <PlatformBenefit text="Keep your product inventory in sync" />
                    <PlatformBenefit text="Maintain your SEO data and product URLs" />

                    <div className="mt-8 p-4 bg-muted dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                        Shopify-Specific Features
                      </h4>
                      <p className="text-sm text-muted-foreground dark:text-gray-300">
                        FreshFront preserves your Shopify product tags,
                        metafields, and custom product types for a seamless
                        transition.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="bigcommerce" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-white/90 dark:bg-gray-800 backdrop-blur-sm shadow-xl border-0">
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                      Import Process
                    </h3>
                    <IntegrationStep
                      number={1}
                      title="Link Your BigCommerce Store"
                      description="Connect your BigCommerce account through our secure OAuth integration."
                    />
                    <IntegrationStep
                      number={2}
                      title="Configure Import Settings"
                      description="Select which store elements and product data you want to import."
                    />
                    <IntegrationStep
                      number={3}
                      title="Migrate and Launch"
                      description="Complete the import and start enhancing your store with FreshFront features."
                    />
                    <Button
                      className="mt-4 w-full text-black"
                      onClick={() =>
                        window.open("https://freshfront.co", "_blank")
                      }
                    >
                      Connect BigCommerce Store{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-white/90 dark:bg-gray-800 backdrop-blur-sm shadow-xl border-0">
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                      Benefits
                    </h3>
                    <PlatformBenefit text="Import complete product catalog with all details" />
                    <PlatformBenefit text="Transfer category hierarchy and product relationships" />
                    <PlatformBenefit text="Preserve product options and modifiers" />
                    <PlatformBenefit text="Import customer reviews and ratings" />
                    <PlatformBenefit text="Maintain product filters and search attributes" />

                    <div className="mt-8 p-4 bg-muted dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                        BigCommerce-Specific Features
                      </h4>
                      <p className="text-sm text-muted-foreground dark:text-gray-300">
                        FreshFront supports BigCommerce's custom fields, product
                        rules, and complex pricing models during the import
                        process.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="etsy" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-white/90 dark:bg-gray-800 backdrop-blur-sm shadow-xl border-0">
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                      Import Process
                    </h3>
                    <IntegrationStep
                      number={1}
                      title="Connect Your Etsy Shop"
                      description="Authorize FreshFront to access your Etsy shop data securely."
                    />
                    <IntegrationStep
                      number={2}
                      title="Select What to Import"
                      description="Choose which listings, sections, and shop details you want to bring over."
                    />
                    <IntegrationStep
                      number={3}
                      title="Review and Confirm"
                      description="Preview how your imported data will look in FreshFront before finalizing."
                    />
                    <Button
                      className="mt-4 w-full text-black"
                      onClick={() =>
                        window.open("https://freshfront.co", "_blank")
                      }
                    >
                      Connect Etsy Shop{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-white/90 dark:bg-gray-800 backdrop-blur-sm shadow-xl border-0">
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
                      Benefits
                    </h3>
                    <PlatformBenefit text="Import all listings with images, descriptions, and variations" />
                    <PlatformBenefit text="Transfer shop sections and categories structure" />
                    <PlatformBenefit text="Bring over shop branding and policies" />
                    <PlatformBenefit text="Keep your listing inventory in sync" />
                    <PlatformBenefit text="Maintain your SEO data and listing URLs" />

                    <div className="mt-8 p-4 bg-muted dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                        Etsy-Specific Features
                      </h4>
                      <p className="text-sm text-muted-foreground dark:text-gray-300">
                        FreshFront preserves your Etsy listing tags,
                        materials, and production partners for a seamless
                        transition.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground dark:text-gray-300 mb-4">
            Don't have an existing store? No problem!
          </p>
          <Button
            variant="outline"
            size="lg"
            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            onClick={() => window.open("https://freshfront.co", "_blank")}
          >
            Start from Scratch with AI
          </Button>
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;
