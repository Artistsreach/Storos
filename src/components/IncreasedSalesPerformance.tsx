import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  MessageSquare,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Eye,
  Clock,
  DollarSign,
} from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  percentage: string;
  description: string;
  color: string;
  delay?: number;
}

const StatCard = ({
  icon,
  title,
  percentage,
  description,
  color,
  delay = 0,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group"
    >
      <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
        />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}
            >
              {icon}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.3 }}
              className="text-right"
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {percentage}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Increase
              </div>
            </motion.div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface FeatureHighlightProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stats: string[];
  color: string;
  delay?: number;
}

const FeatureHighlight = ({
  icon,
  title,
  description,
  stats,
  color,
  delay = 0,
}: FeatureHighlightProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay }}
      viewport={{ once: true }}
      className="group"
    >
      <Card className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
        />
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{description}</p>
            </div>
          </div>
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: delay + 0.2 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/80 hover:bg-gray-100/80 dark:hover:bg-gray-600/80 transition-colors duration-200"
              >
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stat}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const IncreasedSalesPerformance = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative py-24 px-4 md:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-r from-green-400 to-blue-400 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants}>
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-0"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              PROVEN RESULTS
            </Badge>
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent"
          >
            Skyrocket Your Sales Performance
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            AI-powered e-commerce tools are revolutionizing online retail with
            measurable impacts on sales performance and business success. See
            how our platform drives exponential growth for entrepreneurs.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Conversion Rate"
            percentage="45%"
            description="Average increase in conversion rates with AI personalization and optimization"
            color="from-green-500 to-emerald-600"
            delay={0}
          />
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            title="Revenue Growth"
            percentage="300%"
            description="Multi-store operators see 200-400% revenue growth within the first year"
            color="from-blue-500 to-cyan-600"
            delay={0.1}
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            title="Setup Time"
            percentage="70%"
            description="Reduction in setup time from months to hours with AI-generated stores"
            color="from-purple-500 to-violet-600"
            delay={0.2}
          />
          <StatCard
            icon={<Target className="h-6 w-6" />}
            title="Customer Lifetime Value"
            percentage="50%"
            description="Improvement in customer lifetime value through AI-powered experiences"
            color="from-pink-500 to-rose-600"
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <FeatureHighlight
            icon={<Users className="h-8 w-8" />}
            title="AI Personalization"
            description="Dynamic experiences that convert browsers into buyers"
            stats={[
              "10-15% increase in conversion rates",
              "10-30% boost in average order value",
              "6x higher transaction rates in email campaigns",
              "Reduce cart abandonment from 70% to 45%",
            ]}
            color="from-blue-500 to-indigo-600"
            delay={0}
          />
          <FeatureHighlight
            icon={<Eye className="h-8 w-8" />}
            title="AI Product Visualizers"
            description="Immersive shopping experiences with visual commerce"
            stats={[
              "40-200% increase in conversion rates",
              "20-30% reduction in return rates",
              "60-80% boost in engagement time",
              "11x higher likelihood of purchase",
            ]}
            color="from-purple-500 to-pink-600"
            delay={0.2}
          />
          <FeatureHighlight
            icon={<MessageSquare className="h-8 w-8" />}
            title="AI Chatbot Assistants"
            description="24/7 intelligent customer support and sales assistance"
            stats={[
              "Handle 80% of routine customer inquiries",
              "67% increase in sales conversion rates",
              "15-25% boost in average order values",
              "7x higher conversion with sub-1-minute response",
            ]}
            color="from-green-500 to-teal-600"
            delay={0.4}
          />
          <FeatureHighlight
            icon={<Zap className="h-8 w-8" />}
            title="Instant AI-Generated Stores"
            description="Rapid deployment for quick market testing and scaling"
            stats={[
              "Setup time reduced from months to hours",
              "70% lower upfront costs",
              "Test multiple markets simultaneously",
              "3-5x faster growth with store managers",
            ]}
            color="from-orange-500 to-red-600"
            delay={0.6}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 dark:border-gray-700/20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-purple-900 dark:from-white dark:to-purple-200 bg-clip-text text-transparent">
              Combined Performance Impact
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Businesses using comprehensive AI e-commerce solutions report
              remarkable improvements across all key metrics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-100 dark:border-gray-600"
            >
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Operational Excellence
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• 25-45% increase in conversion rates</li>
                <li>• 20-35% reduction in acquisition costs</li>
                <li>• 40-60% increase in session duration</li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border border-green-100 dark:border-gray-600"
            >
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Financial Growth
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• 30-50% improvement in customer LTV</li>
                <li>• 15-25% improvement in profit margins</li>
                <li>• 200-400% revenue growth potential</li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border border-purple-100 dark:border-gray-600"
            >
              <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Scaling Success
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Create 10-15 stores in first year</li>
                <li>• 2-3 become primary revenue generators</li>
                <li>• 3-5x faster growth with delegation</li>
              </ul>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white pt-20">
            Ready to Start Your E-commerce Business?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Sign up and create your first store today for free.
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.open("https://freshfront.co", "_blank")}
            >
              Start Building Your Empire
              <ArrowUpRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default IncreasedSalesPerformance;
