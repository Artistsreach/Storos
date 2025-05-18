import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Tag, PieChart } from "lucide-react";
// Tabs components are not used in this file based on the provided code
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const CustomersTab = () => {
  // Mock data for demonstration
  const mockCustomers = [
    {
      id: "CUS-1234",
      name: "John Doe",
      email: "john.doe@example.com",
      orders: 5,
      totalSpent: "$345.75",
      lastOrder: "2023-05-10",
      segment: "Loyal",
    },
    {
      id: "CUS-1235",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      orders: 2,
      totalSpent: "$129.50",
      lastOrder: "2023-04-22",
      segment: "New",
    },
    {
      id: "CUS-1236",
      name: "Robert Johnson",
      email: "robert.j@example.com",
      orders: 8,
      totalSpent: "$780.25",
      lastOrder: "2023-05-15",
      segment: "VIP",
    },
  ];

  const mockSegments = [
    {
      id: "SEG-1",
      name: "New Customers",
      count: 124,
      description: "Customers with 1-2 orders",
    },
    {
      id: "SEG-2",
      name: "Loyal Customers",
      count: 86,
      description: "Customers with 3-7 orders",
    },
    {
      id: "SEG-3",
      name: "VIP Customers",
      count: 32,
      description: "Customers with 8+ orders",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Customers</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {mockSegments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{segment.name}</CardTitle>
              <CardDescription>{segment.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{segment.count}</div>
              <Button variant="link" className="p-0">
                View customers
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>
              AI-generated insights about your customer base
            </CardDescription>
          </div>
          <Button variant="outline">
            <PieChart className="mr-2 h-4 w-4" />
            Generate New Insights
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Demographics</h3>
              <div className="h-64 flex items-center justify-center bg-card rounded-md border">
                <p className="text-muted-foreground">
                  Demographics chart placeholder
                </p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Your customer base is primarily 25-34 years old (45%), followed
                by 35-44 years old (30%). The gender distribution is 55% female
                and 45% male.
              </p>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Geographic Distribution</h3>
              <div className="h-64 flex items-center justify-center bg-card rounded-md border">
                <p className="text-muted-foreground">
                  Geographic map placeholder
                </p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Most of your customers are from California (25%), New York
                (18%), and Texas (12%). International customers make up 15% of
                your customer base.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Customers</CardTitle>
            <CardDescription>
              View and manage your customer database
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Tag className="mr-2 h-4 w-4" />
              Add Tags
            </Button>
            <Button>
              <Users className="mr-2 h-4 w-4" />
              Create Segment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center">
            <Input
              placeholder="Search customers..."
              className="max-w-sm mr-2"
            />
            <Button variant="outline">Search</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Orders</th>
                  <th className="text-left py-3 px-4">Total Spent</th>
                  <th className="text-left py-3 px-4">Last Order</th>
                  <th className="text-left py-3 px-4">Segment</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{customer.id}</td>
                    <td className="py-3 px-4">{customer.name}</td>
                    <td className="py-3 px-4">{customer.email}</td>
                    <td className="py-3 px-4">{customer.orders}</td>
                    <td className="py-3 px-4">{customer.totalSpent}</td>
                    <td className="py-3 px-4">{customer.lastOrder}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${customer.segment === "VIP" ? "bg-purple-100 text-purple-800" : customer.segment === "Loyal" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                      >
                        {customer.segment}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersTab;
