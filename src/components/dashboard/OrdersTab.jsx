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
import { ShoppingCart, AlertTriangle, Package, RefreshCw } from "lucide-react";

const OrdersTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("all");

  // Mock data for demonstration
  const mockOrders = [
    {
      id: "ORD-1234",
      customer: "John Doe",
      date: "2023-05-15",
      total: "$129.99",
      status: "Fulfilled",
    },
    {
      id: "ORD-1235",
      customer: "Jane Smith",
      date: "2023-05-14",
      total: "$89.50",
      status: "Processing",
    },
    {
      id: "ORD-1236",
      customer: "Robert Johnson",
      date: "2023-05-13",
      total: "$210.75",
      status: "Pending",
    },
  ];

  const mockAbandonedCarts = [
    {
      id: "CART-567",
      customer: "Emily Davis",
      date: "2023-05-15",
      items: 3,
      total: "$78.45",
      timeSpent: "12m 30s",
    },
    {
      id: "CART-568",
      customer: "Michael Brown",
      date: "2023-05-14",
      items: 2,
      total: "$45.99",
      timeSpent: "5m 15s",
    },
  ];

  const mockReturns = [
    {
      id: "RET-890",
      orderId: "ORD-1230",
      customer: "Sarah Wilson",
      date: "2023-05-10",
      amount: "$65.00",
      reason: "Wrong size",
    },
    {
      id: "RET-891",
      orderId: "ORD-1228",
      customer: "David Miller",
      date: "2023-05-09",
      amount: "$120.50",
      reason: "Damaged item",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>

      <Tabs
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">
            <ShoppingCart className="mr-2 h-4 w-4" />
            All Orders
          </TabsTrigger>
          <TabsTrigger value="abandoned">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Abandoned Checkouts
          </TabsTrigger>
          <TabsTrigger value="returns">
            <RefreshCw className="mr-2 h-4 w-4" />
            Returns & Refunds
          </TabsTrigger>
          <TabsTrigger value="fulfillment">
            <Package className="mr-2 h-4 w-4" />
            Order Fulfillment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>
                View and manage all customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{order.id}</td>
                        <td className="py-3 px-4">{order.customer}</td>
                        <td className="py-3 px-4">{order.date}</td>
                        <td className="py-3 px-4">{order.total}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${order.status === "Fulfilled" ? "bg-green-100 text-green-800" : order.status === "Processing" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abandoned">
          <Card>
            <CardHeader>
              <CardTitle>Abandoned Checkouts</CardTitle>
              <CardDescription>
                View details of abandoned shopping carts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Cart ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Items</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Time Spent</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockAbandonedCarts.map((cart) => (
                      <tr key={cart.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{cart.id}</td>
                        <td className="py-3 px-4">{cart.customer}</td>
                        <td className="py-3 px-4">{cart.date}</td>
                        <td className="py-3 px-4">{cart.items}</td>
                        <td className="py-3 px-4">{cart.total}</td>
                        <td className="py-3 px-4">{cart.timeSpent}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle>Returns & Refunds</CardTitle>
              <CardDescription>
                Manage customer returns and process refunds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Return ID</th>
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Reason</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockReturns.map((returnItem) => (
                      <tr
                        key={returnItem.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{returnItem.id}</td>
                        <td className="py-3 px-4">{returnItem.orderId}</td>
                        <td className="py-3 px-4">{returnItem.customer}</td>
                        <td className="py-3 px-4">{returnItem.date}</td>
                        <td className="py-3 px-4">{returnItem.amount}</td>
                        <td className="py-3 px-4">{returnItem.reason}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="mr-2">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Process
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fulfillment">
          <Card>
            <CardHeader>
              <CardTitle>Order Fulfillment</CardTitle>
              <CardDescription>
                Manage and fulfill pending orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Fraud Risk</th>
                      <th className="text-left py-3 px-4">Customer Score</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{order.id}</td>
                        <td className="py-3 px-4">{order.customer}</td>
                        <td className="py-3 px-4">{order.date}</td>
                        <td className="py-3 px-4">{order.total}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${order.status === "Fulfilled" ? "bg-green-100 text-green-800" : order.status === "Processing" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Low
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {Math.floor(Math.random() * 100)}/100
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="mr-2">
                            View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            disabled={order.status === "Fulfilled"}
                          >
                            Fulfill
                          </Button>
                        </td>
                      </tr>
                    ))}
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

export default OrdersTab;
