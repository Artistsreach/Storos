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
import { Input } from "@/components/ui/input";
import { Package, Tag, Grid } from "lucide-react";

const ProductsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("all");

  // Mock data for demonstration
  const mockProducts = [
    {
      id: "PRD-1234",
      name: "Premium T-Shirt",
      category: "Apparel",
      price: "$29.99",
      inventory: 45,
      status: "Active",
    },
    {
      id: "PRD-1235",
      name: "Wireless Headphones",
      category: "Electronics",
      price: "$89.50",
      inventory: 12,
      status: "Active",
    },
    {
      id: "PRD-1236",
      name: "Leather Wallet",
      category: "Accessories",
      price: "$49.99",
      inventory: 0,
      status: "Out of Stock",
    },
  ];

  const mockCollections = [
    {
      id: "COL-567",
      name: "Summer Collection",
      products: 12,
      type: "Manual",
      status: "Active",
    },
    {
      id: "COL-568",
      name: "Holiday Specials",
      products: 8,
      type: "AI Generated",
      status: "Draft",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <Tabs
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="all">
            <Package className="mr-2 h-4 w-4" />
            All Products
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Tag className="mr-2 h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="collections">
            <Grid className="mr-2 h-4 w-4" />
            Collections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Products</CardTitle>
                <CardDescription>Manage your product catalog</CardDescription>
              </div>
              <Button>
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center">
                <Input
                  placeholder="Search products..."
                  className="max-w-sm mr-2"
                />
                <Button variant="outline">Search</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Inventory</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{product.id}</td>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.category}</td>
                        <td className="py-3 px-4">{product.price}</td>
                        <td className="py-3 px-4">{product.inventory}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${product.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="mr-2">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Track and update product inventory levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Current Stock</th>
                      <th className="text-left py-3 px-4">Low Stock Alert</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{product.id}</td>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.inventory}</td>
                        <td className="py-3 px-4">10</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${product.inventory > 10 ? "bg-green-100 text-green-800" : product.inventory > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                          >
                            {product.inventory > 10
                              ? "In Stock"
                              : product.inventory > 0
                                ? "Low Stock"
                                : "Out of Stock"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            Update Stock
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

        <TabsContent value="collections">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Collections</CardTitle>
                <CardDescription>
                  Organize products into collections
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Grid className="mr-2 h-4 w-4" />
                  Create Manual Collection
                </Button>
                <Button>
                  <Grid className="mr-2 h-4 w-4" />
                  Generate with AI
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Collection Name</th>
                      <th className="text-left py-3 px-4">Products</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCollections.map((collection) => (
                      <tr
                        key={collection.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{collection.id}</td>
                        <td className="py-3 px-4">{collection.name}</td>
                        <td className="py-3 px-4">{collection.products}</td>
                        <td className="py-3 px-4">{collection.type}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${collection.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {collection.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="mr-2">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductsTab;
