import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowLeft, Book, Code, Zap } from "lucide-react";

const Documentation = () => {
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
              Documentation
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Learn how to build amazing e-commerce stores with FreshFront's
              powerful tools and features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Getting Started
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Quick start guide to create your first store in minutes.
              </p>
              <Button variant="outline" className="w-full">
                Coming Soon
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
                <Book className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                User Guide
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Comprehensive guides for all FreshFront features.
              </p>
              <Button variant="outline" className="w-full">
                Coming Soon
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
                <Code className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                API Reference
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Technical documentation for developers and integrations.
              </p>
              <Button variant="outline" className="w-full">
                Coming Soon
              </Button>
            </div>
          </div>

          <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Documentation Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We're working hard to create comprehensive documentation for
              FreshFront. In the meantime, feel free to reach out to our support
              team for any questions.
            </p>
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() =>
                (window.location.href = "mailto:info@freshfront.co")
              }
            >
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Documentation;
