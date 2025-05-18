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
import { Input } from "@/components/ui/input"; // Assuming Input is also from ui
import { Truck, Globe, Package, RefreshCw, FileText } from "lucide-react";

const ShippingTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("rates");

  // Mock data for demonstration
  const mockShippingZones = [
    {
      id: "ZONE-1",
      name: "Domestic",
      countries: ["United States"],
      methods: [
        { name: "Standard", price: "$5.99", deliveryTime: "3-5 business days" },
        { name: "Express", price: "$12.99", deliveryTime: "1-2 business days" },
      ],
    },
    {
      id: "ZONE-2",
      name: "Canada & Mexico",
      countries: ["Canada", "Mexico"],
      methods: [
        { name: "Standard", price: "$9.99", deliveryTime: "5-7 business days" },
        { name: "Express", price: "$19.99", deliveryTime: "2-3 business days" },
      ],
    },
    {
      id: "ZONE-3",
      name: "International",
      countries: ["Rest of World"],
      methods: [
        {
          name: "Standard",
          price: "$14.99",
          deliveryTime: "7-14 business days",
        },
        { name: "Express", price: "$29.99", deliveryTime: "3-5 business days" },
      ],
    },
  ];

  const mockDropshippingSuppliers = [
    {
      id: "SUP-1",
      name: "GlobalDropship Inc.",
      products: 245,
      avgShippingTime: "4-7 days",
      status: "Connected",
    },
    {
      id: "SUP-2",
      name: "FastShip Solutions",
      products: 189,
      avgShippingTime: "3-5 days",
      status: "Pending",
    },
    {
      id: "SUP-3",
      name: "EcoPackaging Co.",
      products: 78,
      avgShippingTime: "5-8 days",
      status: "Connected",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Shipping & Delivery</h1>

      <Tabs
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="rates">
            <Truck className="mr-2 h-4 w-4" />
            Shipping Rates
          </TabsTrigger>
          <TabsTrigger value="dropshipping">
            <Globe className="mr-2 h-4 w-4" />
            Dropshipping
          </TabsTrigger>
          <TabsTrigger value="policy">
            <FileText className="mr-2 h-4 w-4" />
            Shipping Policy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shipping Zones & Rates</CardTitle>
                <CardDescription>
                  Configure shipping rates by zone and package type
                </CardDescription>
              </div>
              <Button>
                <Globe className="mr-2 h-4 w-4" />
                Add Shipping Zone
              </Button>
            </CardHeader>
            <CardContent>
              {mockShippingZones.map((zone) => (
                <Card key={zone.id} className="mb-6">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Countries: {zone.countries.join(", ")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Method</th>
                            <th className="text-left py-3 px-4">Price</th>
                            <th className="text-left py-3 px-4">
                              Delivery Time
                            </th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {zone.methods.map((method, index) => (
                            <tr
                              key={index}
                              className="border-b hover:bg-muted/50"
                            >
                              <td className="py-3 px-4">{method.name}</td>
                              <td className="py-3 px-4">{method.price}</td>
                              <td className="py-3 px-4">
                                {method.deliveryTime}
                              </td>
                              <td className="py-3 px-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mr-2"
                                >
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm">
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Package className="mr-2 h-4 w-4" />
                      Add Shipping Method
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-2">Package Types</h3>
                <p className="text-sm mb-4">
                  Define standard package types to calculate shipping rates
                  accurately.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Small Package</h4>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Up to 1 lb, 9" x 6" x 2"
                    </p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Medium Package</h4>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Up to 5 lbs, 12" x 9" x 4"
                    </p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Large Package</h4>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Up to 10 lbs, 18" x 12" x 6"
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Package className="mr-2 h-4 w-4" />
                  Add Package Type
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dropshipping">
          <Card>
            <CardHeader>
              <CardTitle>Dropshipping Integration</CardTitle>
              <CardDescription>
                Connect with dropshipping suppliers and manage fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Fulfillment Mode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" className="flex-1">
                        Self-Fulfillment
                      </Button>
                      <Button variant="default" className="flex-1">
                        Dropshipping
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Hybrid
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Current mode: <strong>Dropshipping</strong>. Products will
                      be shipped directly from suppliers to customers.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Connect Supplier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter supplier API key or ID"
                        className="flex-1"
                      />
                      <Button>
                        <Globe className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      We support direct integration with AliExpress, Spocket,
                      Oberlo, and more.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="font-medium mb-3">Connected Suppliers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Supplier</th>
                      <th className="text-left py-3 px-4">Products</th>
                      <th className="text-left py-3 px-4">
                        Avg. Shipping Time
                      </th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDropshippingSuppliers.map((supplier) => (
                      <tr
                        key={supplier.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{supplier.name}</td>
                        <td className="py-3 px-4">{supplier.products}</td>
                        <td className="py-3 px-4">
                          {supplier.avgShippingTime}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${supplier.status === "Connected" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {supplier.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="mr-2">
                            View Products
                          </Button>
                          <Button variant="outline" size="sm">
                            Disconnect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-2">Automatic Order Routing</h3>
                <p className="text-sm mb-4">
                  Configure how orders are routed to different suppliers based
                  on product, location, or other criteria.
                </p>
                <div className="flex gap-2">
                  <Button>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Configure Routing Rules
                  </Button>
                  <Button variant="outline">
                    <Package className="mr-2 h-4 w-4" />
                    View Order Queue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Policy & Returns</CardTitle>
              <CardDescription>
                Configure your shipping policy and return management settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-3">Shipping Policy</h3>
                  <div className="border rounded-md p-4 h-64 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <h4>Shipping Policy</h4>
                      <p>
                        We ship to all 50 US states and select international
                        destinations. Orders are typically processed within 1-2
                        business days.
                      </p>
                      <h5>Domestic Shipping</h5>
                      <p>
                        Standard shipping (3-5 business days): $5.99
                        <br />
                        Express shipping (1-2 business days): $12.99
                      </p>
                      <h5>International Shipping</h5>
                      <p>
                        Standard shipping (7-14 business days): $14.99
                        <br />
                        Express shipping (3-5 business days): $29.99
                      </p>
                      <p>
                        Free shipping on all domestic orders over $50. Shipping
                        times may vary during peak seasons and holidays.
                      </p>
                    </div>
                  </div>
                  <Button className="mt-4">
                    <FileText className="mr-2 h-4 w-4" />
                    Edit Shipping Policy
                  </Button>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Return Policy</h3>
                  <div className="border rounded-md p-4 h-64 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <h4>Return Policy</h4>
                      <p>
                        We offer a 30-day return policy for most items. To be
                        eligible for a return, your item must be unused and in
                        the same condition that you received it.
                      </p>
                      <h5>Return Process</h5>
                      <p>
                        1. Contact our customer service team
                        <br />
                        2. Receive a Return Merchandise Authorization (RMA)
                        number
                        <br />
                        3. Ship the item back with the RMA number clearly marked
                        <br />
                        4. Once received, we will process your refund within 5-7
                        business days
                      </p>
                      <h5>Exceptions</h5>
                      <p>
                        Certain items cannot be returned, including:
                        <br />
                        - Personalized or custom-made products
                        <br />
                        - Digital downloads
                        <br />- Gift cards
                      </p>
                    </div>
                  </div>
                  <Button className="mt-4">
                    <FileText className="mr-2 h-4 w-4" />
                    Edit Return Policy
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-2">Return Management</h3>
                <p className="text-sm mb-4">
                  Configure how returns are processed and managed.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Return Window</h4>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue="30" className="w-20" />
                      <span className="text-sm">days after delivery</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Restocking Fee</h4>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue="10" className="w-20" />
                      <span className="text-sm">% of item price</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Return Labels</h4>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Customer Pays
                      </Button>
                      <Button variant="default" size="sm">
                        Store Provides
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Refund Method</h4>
                    <div className="flex items-center gap-2">
                      <Button variant="default" size="sm">
                        Original Payment
                      </Button>
                      <Button variant="outline" size="sm">
                        Store Credit
                      </Button>
                    </div>
                  </div>
                </div>
                <Button className="mt-4">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Save Return Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShippingTab;
