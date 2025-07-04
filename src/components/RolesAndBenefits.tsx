import React from "react";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Briefcase, User, ArrowRight, ShoppingCart } from "lucide-react";

const RolesAndBenefits = () => {
  const roles = [
    {
      title: "Creators",
      icon: <User className="h-8 w-8 text-green-600" />,
      benefits: [
        "Launch profitable print-on-demand stores with minimal technical expertise.",
        "Keep 100% of profits or split fees with Manager.",
        "AI handles design, store creation, marketing materials, and technical complexity.",
        "Primary users include artists, designers, entrepreneurs, and content creators.",
      ],
    },
    {
      title: "Managers",
      icon: <Briefcase className="h-8 w-8 text-blue-600" />,
      benefits: [
        "Service providers who handle fulfillment monitoring and creator promotion.",
        "Scale revenue by managing multiple creators with AI-powered tools.",
        "Onboard creators and earn fees from every sale (1-5%)",
        "Requires ID verification and a $99/month subscription.",
      ],
    },
    {
      title: "Customers",
      icon: <ShoppingCart className="h-8 w-8 text-purple-600" />,
      benefits: [
        "Enhanced shopping with AI-powered personalization and support.",
        "Features include product visualization, AI search, and personalized recommendations.",
        "Receive real-time assistance for a seamless experience.",
        "Enjoy a superior shopping journey from discovery to checkout.",
      ],
    },
  ];

  return (
    <section className="relative w-full bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 dark:from-gray-900 dark:via-slate-800 dark:to-blue-900 overflow-hidden">
      {/* Enhanced Background pattern with modern glassmorphism */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400 to-sky-300 dark:from-blue-500 dark:to-sky-400 blur-3xl animate-pulse" />
        <div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gradient-to-r from-sky-300 to-blue-400 dark:from-sky-400 dark:to-blue-600 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-gradient-to-r from-blue-300 to-sky-400 dark:from-blue-600 dark:to-sky-500 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Modern geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-sky-300/20 rounded-3xl rotate-45 animate-float" />
        <div
          className="absolute bottom-32 left-1/4 w-24 h-24 bg-gradient-to-br from-sky-400/20 to-blue-300/20 rounded-2xl rotate-12 animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/3 left-10 w-16 h-16 bg-gradient-to-br from-blue-300/30 to-sky-400/30 rounded-xl rotate-45 animate-float"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [-20, 20, -20], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-16 h-16 bg-white/30 dark:bg-white/20 rounded-2xl backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-16 w-12 h-12 bg-white/30 dark:bg-white/20 rounded-full backdrop-blur-sm"
        />
      </div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-0"
          >
            EMPOWERING ROLES
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 dark:from-white dark:via-blue-200 dark:to-cyan-200 bg-clip-text text-transparent">
            Find Your Place in Our Ecosystem
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our AI-powered e-commerce platform provides a comprehensive ecosystem for creators, managers, and customers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200/50 dark:border-blue-700/50 shadow-lg">
            <CardContent className="p-8">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                FreshFront enables creators to build, launch, and manage print-on-demand stores with unprecedented automation. The platform leverages advanced AI for design generation, store creation, content production, and customer experience optimization.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {role.icon}
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                    {role.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {role.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start text-lg">
                        <ArrowRight className="h-4 w-4 mr-3 mt-1 text-primary flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesAndBenefits;
