import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowLeft, Calendar, User, ArrowRight } from "lucide-react";

const Blog = () => {
  const placeholderPosts = [
    {
      title: "Building Your First E-commerce Store with AI",
      excerpt:
        "Learn how to leverage AI tools to create a professional online store in minutes, not hours.",
      date: "Coming Soon",
      author: "FreshFront Team",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    },
    {
      title: "The Future of E-commerce: AI-Powered Personalization",
      excerpt:
        "Discover how artificial intelligence is revolutionizing the way customers shop online.",
      date: "Coming Soon",
      author: "FreshFront Team",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    },
    {
      title: "Maximizing Conversions with Smart Product Recommendations",
      excerpt:
        "Best practices for using AI to increase sales and improve customer experience.",
      date: "Coming Soon",
      author: "FreshFront Team",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Button
            variant="ghost"
            className="mb-8"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              FreshFront Blog
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Insights, tips, and updates from the world of AI-powered
              e-commerce.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {placeholderPosts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {post.excerpt}
                  </p>
                  <Button variant="outline" className="w-full group" disabled>
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Blog Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're preparing exciting content about e-commerce, AI, and
              business growth. Stay tuned for insights that will help you build
              better online stores.
            </p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() =>
                (window.location.href =
                  "mailto:info@freshfront.co?subject=Blog Updates")
              }
            >
              Get Notified
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Blog;
