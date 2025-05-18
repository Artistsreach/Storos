import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Input is not used in this file based on the provided code
// import { Input } from "@/components/ui/input"; 
import { BarChart2, TrendingUp, Users, Target, Package } from "lucide-react";

const AnalyticsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("sales");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics & Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$12,845.75</div>
            <p className="text-sm text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">156</div>
            <p className="text-sm text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3.2%</div>
            <p className="text-sm text-red-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> -0.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$82.34</div>
            <p className="text-sm text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" /> +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="sales">
            <BarChart2 className="mr-2 h-4 w-4" />
            Sales Reports
          </TabsTrigger>
          <TabsTrigger value="traffic">
            <TrendingUp className="mr-2 h-4 w-4" />
            Traffic & Conversion
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="mr-2 h-4 w-4" />
            Customer Insights
          </TabsTrigger>
          <TabsTrigger value="marketing">
            <Target className="mr-2 h-4 w-4" />
            Marketing Attribution
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" />
            Product Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                  Comprehensive sales data with AI summarization
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Export</Button>
                <Button variant="outline">Print</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="h-80 flex items-center justify-center bg-muted rounded-md">
                  <p className="text-muted-foreground">
                    Sales chart placeholder
                  </p>
                </div>
              </div>

              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">AI Sales Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    <strong>Key Insights:</strong> Your sales have increased by
                    15% compared to last month, with the highest growth in the
                    "Electronics" category (+24%). Weekend sales are
                    particularly strong, accounting for 45% of your weekly
                    revenue. The average order value has increased by 5%,
                    indicating customers are purchasing higher-value items.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Recommendations:</strong> Consider running
                    promotions on weekdays to boost sales during slower periods.
                    The "Apparel" category has seen a slight decline (-3%) and
                    may benefit from new product additions or targeted
                    marketing.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Traffic & Conversion Analysis</CardTitle>
              <CardDescription>
                Website traffic sources and conversion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-3">Traffic Sources</h3>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-md">
                    <p className="text-muted-foreground">
                      Traffic sources chart placeholder
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Conversion Funnel</h3>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-md">
                    <p className="text-muted-foreground">
                      Conversion funnel chart placeholder
                    </p>
                  </div>
                </div>
              </div>

              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    AI Conversion Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Your current conversion rate of 3.2% is below the industry
                    average of 4.5% for e-commerce stores in your category. The
                    biggest drop-off occurs at the checkout page (45%
                    abandonment rate).
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Recommendations:</strong>
                  </p>
                  <ul className="text-sm list-disc pl-5 mt-1">
                    <li>
                      Simplify your checkout process by reducing the number of
                      form fields
                    </li>
                    <li>
                      Add trust badges and security indicators near payment
                      information
                    </li>
                    <li>
                      Implement exit-intent popups with discount offers to
                      reduce cart abandonment
                    </li>
                    <li>
                      Optimize product page load times (currently averaging
                      3.2s, aim for under 2s)
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>
                Detailed analysis of customer behavior and demographics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-3">Customer Demographics</h3>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-md">
                    <p className="text-muted-foreground">
                      Demographics chart placeholder
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Purchase Frequency</h3>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-md">
                    <p className="text-muted-foreground">
                      Purchase frequency chart placeholder
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Customer Lifetime Value</h3>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-md">
                    <p className="text-muted-foreground">
                      CLV chart placeholder
                    </p>
                  </div>
                </div>
              </div>

              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Customer Personas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card p-3 rounded-md border">
                      <h4 className="font-medium">Tech-Savvy Millennials</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        25-34 years old, urban areas, high income
                      </p>
                      <p className="text-sm mt-2">
                        Prefer electronics and premium products, shop primarily
                        on mobile devices
                      </p>
                    </div>

                    <div className="bg-card p-3 rounded-md border">
                      <h4 className="font-medium">Budget-Conscious Families</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        35-44 years old, suburban areas, middle income
                      </p>
                      <p className="text-sm mt-2">
                        Focus on value, frequently use discount codes, buy in
                        bulk
                      </p>
                    </div>

                    <div className="bg-card p-3 rounded-md border">
                      <h4 className="font-medium">Luxury Shoppers</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        45-60 years old, various locations, high income
                      </p>
                      <p className="text-sm mt-2">
                        Purchase high-end products, less price sensitive, value
                        quality and service
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Attribution</CardTitle>
              <CardDescription>
                Track the effectiveness of your marketing channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="h-80 flex items-center justify-center bg-muted rounded-md">
                  <p className="text-muted-foreground">
                    Marketing attribution chart placeholder
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Channel</th>
                      <th className="text-left py-3 px-4">Sessions</th>
                      <th className="text-left py-3 px-4">Conversions</th>
                      <th className="text-left py-3 px-4">Conv. Rate</th>
                      <th className="text-left py-3 px-4">Revenue</th>
                      <th className="text-left py-3 px-4">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">Organic Search</td>
                      <td className="py-3 px-4">2,456</td>
                      <td className="py-3 px-4">98</td>
                      <td className="py-3 px-4">4.0%</td>
                      <td className="py-3 px-4">$7,845.00</td>
                      <td className="py-3 px-4">N/A</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">Paid Search</td>
                      <td className="py-3 px-4">1,245</td>
                      <td className="py-3 px-4">62</td>
                      <td className="py-3 px-4">5.0%</td>
                      <td className="py-3 px-4">$4,980.00</td>
                      <td className="py-3 px-4">3.2x</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">Social Media</td>
                      <td className="py-3 px-4">3,120</td>
                      <td className="py-3 px-4">78</td>
                      <td className="py-3 px-4">2.5%</td>
                      <td className="py-3 px-4">$5,460.00</td>
                      <td className="py-3 px-4">2.8x</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">Email Marketing</td>
                      <td className="py-3 px-4">980</td>
                      <td className="py-3 px-4">49</td>
                      <td className="py-3 px-4">5.0%</td>
                      <td className="py-3 px-4">$3,920.00</td>
                      <td className="py-3 px-4">4.5x</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">Direct</td>
                      <td className="py-3 px-4">1,560</td>
                      <td className="py-3 px-4">47</td>
                      <td className="py-3 px-4">3.0%</td>
                      <td className="py-3 px-4">$3,760.00</td>
                      <td className="py-3 px-4">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>
                Detailed analysis of product sales and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-3">Top Selling Products</h3>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-md">
                    <p className="text-muted-foreground">
                      Top products chart placeholder
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">
                    Product Category Performance
                  </h3>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-md">
                    <p className="text-muted-foreground">
                      Category performance chart placeholder
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Units Sold</th>
                      <th className="text-left py-3 px-4">Revenue</th>
                      <th className="text-left py-3 px-4">Profit Margin</th>
                      <th className="text-left py-3 px-4">Return Rate</th>
                      <th className="text-left py-3 px-4">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">Premium T-Shirt</td>
                      <td className="py-3 px-4">Apparel</td>
                      <td className="py-3 px-4">245</td>
                      <td className="py-3 px-4">$7,345.55</td>
                      <td className="py-3 px-4">45%</td>
                      <td className="py-3 px-4">2.1%</td>
                      <td className="py-3 px-4">4.8/5</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">Wireless Headphones</td>
                      <td className="py-3 px-4">Electronics</td>
                      <td className="py-3 px-4">124</td>
                      <td className="py-3 px-4">$11,098.00</td>
                      <td className="py-3 px-4">32%</td>
                      <td className="py-3 px-4">3.5%</td>
                      <td className="py-3 px-4">4.6/5</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">Leather Wallet</td>
                      <td className="py-3 px-4">Accessories</td>
                      <td className="py-3 px-4">98</td>
                      <td className="py-3 px-4">$4,899.02</td>
                      <td className="py-3 px-4">55%</td>
                      <td className="py-3 px-4">1.2%</td>
                      <td className="py-3 px-4">4.9/5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;
