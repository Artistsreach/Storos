import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Search,
  ShoppingCart,
  Settings,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  description: string;
}

const AIAssistantDemo = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI shopping assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(Date.now() - 60000),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [showProducts, setShowProducts] = useState(false);

  const products: Product[] = [
    {
      id: 1,
      name: "Eco-Friendly Water Bottle",
      price: "$24.99",
      image:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&q=80",
      description:
        "Insulated stainless steel bottle that keeps drinks cold for 24 hours or hot for 12 hours.",
    },
    {
      id: 2,
      name: "Organic Cotton T-Shirt",
      price: "$29.99",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80",
      description: "Soft, breathable t-shirt made from 100% organic cotton.",
    },
    {
      id: 3,
      name: "Bamboo Sunglasses",
      price: "$59.99",
      image:
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&q=80",
      description:
        "Stylish sunglasses with polarized lenses and sustainable bamboo frames.",
    },
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      let responseText = "";
      let shouldShowProducts = false;

      if (
        inputValue.toLowerCase().includes("water bottle") ||
        inputValue.toLowerCase().includes("t-shirt") ||
        inputValue.toLowerCase().includes("sunglasses")
      ) {
        responseText = `I found some products that might interest you. Here are some options:`;
        shouldShowProducts = true;
      } else if (inputValue.toLowerCase().includes("shipping")) {
        responseText =
          "We offer free shipping on all orders over $50. Standard shipping takes 3-5 business days.";
      } else if (inputValue.toLowerCase().includes("return")) {
        responseText =
          "Our return policy allows returns within 30 days of purchase. Items must be unused with original packaging.";
      } else {
        responseText =
          "I can help you find products, answer questions about shipping, returns, or provide information about our store. What would you like to know?";
      }

      const assistantMessage: Message = {
        id: messages.length + 2,
        text: responseText,
        sender: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setShowProducts(shouldShowProducts);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <section className="w-full py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-slate-800 dark:to-blue-900 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-sky-700 dark:from-white dark:via-blue-300 dark:to-sky-400 bg-clip-text text-transparent">
            AI Store Assistant
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Every store comes with a customizable AI assistant that helps
            customers find products and answers questions.
          </p>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-blue-400 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-cyan-400 blur-3xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative z-10">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-2xl border-0 h-[500px] flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10">
                <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-slate-50/80 dark:bg-gray-700/80">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=freshfront" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Store Assistant
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400">
                        Online
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-200"
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {showProducts && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="flex flex-col gap-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {products.map((product) => (
                          <motion.div
                            key={product.id}
                            whileHover={{ scale: 1.03 }}
                            className="bg-white dark:bg-gray-700/50 border dark:border-gray-600 rounded-lg overflow-hidden shadow-sm"
                          >
                            <div className="h-32 overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                {product.name}
                              </h4>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                  {product.price}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </CardContent>

                <div className="p-4 border-t dark:border-gray-700 flex gap-2 bg-slate-50/80 dark:bg-gray-700/80">
                  <Input
                    placeholder="Ask about products, shipping, returns..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-grow bg-white dark:bg-gray-600 border-slate-300 dark:border-gray-500 focus:ring-primary/50 dark:placeholder:text-gray-400"
                  />
                  <Button onClick={handleSendMessage} className="dark:bg-black dark:text-white dark:hover:bg-gray-800">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-2xl border-0 h-[500px] flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/10">
                <div className="p-4 border-b dark:border-gray-700 bg-slate-50/80 dark:bg-gray-700/80">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Assistant Features
                  </h3>
                </div>

                <CardContent className="p-6 flex flex-col gap-6">
                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full">
                      <MessageCircle className="h-6 w-6 text-primary dark:text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1 text-gray-900 dark:text-white">
                        Personalized Assistance
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-gray-300">
                        Tailored to your store's products and policies,
                        providing accurate information to customers.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full">
                      <Search className="h-6 w-6 text-primary dark:text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1 text-gray-900 dark:text-white">
                        Smart Product Search
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-gray-300">
                        Helps customers find exactly what they're looking for
                        with interactive product cards.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full">
                      <Settings className="h-6 w-6 text-primary dark:text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1 text-gray-900 dark:text-white">
                        Customizable Behavior
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-gray-300">
                        Program custom instructions in admin mode to tailor the
                        assistant to your brand voice.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-slate-500 dark:text-gray-400 mb-2">
                      Try asking about:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="cursor-pointer bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        onClick={() =>
                          setInputValue("Do you have any water bottles?")
                        }
                      >
                        Water bottles
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        onClick={() =>
                          setInputValue("What is your shipping policy?")
                        }
                      >
                        Shipping policy
                      </Badge>
                      <Badge
                        variant="outline"
                        className="cursor-pointer bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        onClick={() => setInputValue("How do returns work?")}
                      >
                        Returns
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistantDemo;
