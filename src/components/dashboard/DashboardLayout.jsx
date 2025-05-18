import React, { useState } from "react";
import {
  Search,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  BarChart2,
  Mail,
  Truck,
  Settings,
  ArrowLeft, // Added ArrowLeft icon
} from "lucide-react";
import { Link } from "react-router-dom"; // Added Link import
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; 

const DashboardLayout = ({ children, activeTab, setActiveTab, storeId }) => { // Added storeId prop
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const tabs = [
    {
      id: "orders",
      label: "Orders",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      id: "products",
      label: "Products",
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: "customers",
      label: "Customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "payments",
      label: "Payments", // Corrected from "Payments & Payouts" to match id
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: "analytics",
      label: "Analytics", // Corrected from "Analytics & Reports" to match id
      icon: <BarChart2 className="h-5 w-5" />,
    },
    { id: "marketing", label: "Marketing", icon: <Mail className="h-5 w-5" /> },
    { id: "shipping", label: "Shipping", // Corrected from "Shipping & Delivery" to match id
      icon: <Truck className="h-5 w-5" /> 
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Simplified searchableItems to match tab labels for now
  // More granular search can be added later if needed
  const searchableItems = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    tab: tab.id,
    // You can add sub-items here later for more detailed search
    // e.g. subItems: [{id: 'orders-abandoned', label: 'Abandoned Checkouts'}]
  }));


  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const results = [];

    searchableItems.forEach(item => {
      if (item.label.toLowerCase().includes(lowerCaseQuery)) {
        results.push({ id: `${item.id}-main`, label: item.label, tab: item.tab });
      }
      // Example for searching sub-items if they were defined
      if (item.subItems) {
        item.subItems.forEach(subItem => {
          if (subItem.label.toLowerCase().includes(lowerCaseQuery)) {
            results.push({ id: subItem.id, label: `${item.label} > ${subItem.label}`, tab: item.tab });
          }
        });
      }
    });
    
    setSearchResults(results);
  };


  const handleResultClick = (result) => {
    setActiveTab(result.tab);
    // Potentially navigate to a sub-section if your setActiveTab and children rendering supports it
    // For now, it just sets the main tab.
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="flex h-screen bg-muted/40"> {/* Changed to h-screen and bg */}
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col"> {/* Removed h-full, flex handles height */}
        <div className="p-4 border-b flex items-center gap-2"> {/* Added flex items-center gap-2 */}
          {storeId && (
            <Button asChild variant="outline" size="icon" className="flex-shrink-0">
              <Link to={`/store/${storeId}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Store</span>
              </Link>
            </Button>
          )}
          <div className="relative flex-grow"> {/* Added flex-grow */}
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search dashboard..." // More specific placeholder
              className="pl-9 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchResults.length > 0 && (
              <Card className="absolute mt-1 w-full z-50 max-h-64 overflow-y-auto shadow-lg"> {/* Increased z-index and added shadow */}
                <div className="p-1"> {/* Reduced padding for denser list */}
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      className="w-full text-left px-3 py-1.5 hover:bg-accent rounded-md text-sm" // Adjusted padding
                      onClick={() => handleResultClick(result)}
                    >
                      {result.label}
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1"> {/* Added space-y-1 */}
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              className="w-full justify-start text-left h-10 px-3" // Standardized height and padding
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="mr-3">{tab.icon}</span> {/* Increased icon margin */}
              {tab.label}
            </Button>
          ))}
        </nav>
        <div className="p-4 border-t">
            {/* Footer or additional links can go here */}
            <Button variant="ghost" className="w-full justify-start text-left">
                Help & Support
            </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6"> {/* Removed bg-background as parent has it */}
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
