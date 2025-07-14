import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="m-[17px]">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src={
                  isDark
                    ? "https://firebasestorage.googleapis.com/v0/b/freshfront-c3181.firebasestorage.app/o/ffwhite.png?alt=media&token=45fa69e8-8d64-496b-aee3-d406b596ef5f"
                    : "https://firebasestorage.googleapis.com/v0/b/freshfront-c3181.firebasestorage.app/o/Untitled%20design.png?alt=media&token=715b4d03-a8c2-446a-8137-974c779f9aa0"
                }
                alt="FreshFront Logo"
                className="h-8 w-auto transition-all duration-300"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                FreshFront
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#product-visualizer"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector(".product-visualizer-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Visualize
              </a>
              <a
                href="#features"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Personalize
              </a>
              <a
                href="#ai-assistant"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("ai-assistant")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn
              </a>
              <a
                href="#print-on-demand"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  const printOnDemandSection =
                    document.querySelector("section");
                  const sections = document.querySelectorAll("section");
                  for (let section of sections) {
                    if (
                      section.textContent?.includes("Print-on-Demand Generator")
                    ) {
                      section.scrollIntoView({ behavior: "smooth" });
                      break;
                    }
                  }
                }}
              >
                Create
              </a>
              <a
                href="https://build.freshfront.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                App
              </a>
              <a
                href="#integrations"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("integrations")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Integrate
              </a>
              <a
                href="#business-management"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector(".business-management-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Earn
              </a>
            </nav>

            {/* Theme Toggle & CTA */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </Button>

              <Button
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-full transition-all duration-300"
                onClick={() =>
                  window.open("https://freshfront.co", "_blank")
                }
              >
                Launch App
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
