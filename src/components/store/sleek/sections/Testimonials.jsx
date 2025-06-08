import React from "react";
import { motion } from "framer-motion";
import { Star, UserCircle } from "lucide-react";

const testimonialsData = [
  {
    id: 1,
    name: "Sarah L.",
    avatar: "", // Placeholder, ideally use an image URL
    rating: 5,
    text: "Absolutely love the quality and design! My order arrived quickly and the customer service was outstanding. Will definitely shop here again.",
    date: "2024-05-15",
  },
  {
    id: 2,
    name: "Michael B.",
    avatar: "",
    rating: 5,
    text: "Sleek has become my go-to for unique and stylish pieces. The attention to detail is incredible. Highly recommended!",
    date: "2024-05-10",
  },
  {
    id: 3,
    name: "Jessica P.",
    avatar: "",
    rating: 4,
    text: "Great products and a seamless shopping experience. One item was slightly different than expected, but the return process was easy.",
    date: "2024-05-01",
  },
];

const Testimonials = ({ store }) => {
  const { name, theme, id: storeId } = store; // Added name here
  const primaryColor = theme?.primaryColor || "#3B82F6";

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const testimonialVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };

  return (
    <section
      id={`testimonials-${storeId}`}
      className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-950"
    >
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-inter tracking-tight text-foreground">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-inter">
            Hear from our satisfied clients who love the {name} experience and
            our premium products.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {testimonialsData.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="bg-white/60 dark:bg-black/60 backdrop-blur-2xl p-8 shadow-glass-deep hover:shadow-float-lg transition-all duration-500 border border-white/40 dark:border-white/20 hover:border-primary/50 flex flex-col"
              variants={testimonialVariants}
              style={{ "--hover-border-color": primaryColor }}
            >
              <div className="flex items-center mb-6">
                {testimonial.avatar ? (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 mr-4 border-2 border-primary/50"
                    style={{ borderColor: `${primaryColor}80` }}
                  />
                ) : (
                  <UserCircle
                    className="w-14 h-14 mr-4 text-muted-foreground"
                    style={{ color: primaryColor }}
                  />
                )}
                <div>
                  <h4 className="font-semibold text-lg text-foreground font-inter">
                    {testimonial.name}
                  </h4>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 font-inter leading-relaxed flex-grow">
                "{testimonial.text}"
              </p>
              <p className="text-sm text-muted-foreground/70 font-inter self-end">
                {new Date(testimonial.date).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
