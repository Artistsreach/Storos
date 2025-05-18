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
import {
  Mail,
  Instagram,
  Search,
  FileText,
  Tag,
  Calendar,
  PlusCircle,
  BarChart2,
} from "lucide-react";

const MarketingTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("email");

  // Mock data for demonstration
  const mockEmailCampaigns = [
    {
      id: "EM-1234",
      name: "Summer Sale Announcement",
      status: "Sent",
      sentDate: "2023-05-15",
      opens: 1245,
      clicks: 356,
      conversions: 28,
      revenue: "$2,450",
    },
    {
      id: "EM-1235",
      name: "New Product Launch",
      status: "Draft",
      lastEdited: "2023-05-14",
    },
    {
      id: "EM-1236",
      name: "Customer Feedback Request",
      status: "Scheduled",
      scheduledDate: "2023-05-20",
    },
    {
      id: "EM-1237",
      name: "Abandoned Cart Recovery",
      status: "Sent",
      sentDate: "2023-05-12",
      opens: 876,
      clicks: 234,
      conversions: 15,
      revenue: "$1,280",
    },
  ];

  const mockSocialPosts = [
    {
      id: "SM-567",
      platform: "Instagram",
      content: "Summer collection now available!",
      status: "Published",
      publishDate: "2023-05-15",
      engagement: 245,
      likes: 189,
      comments: 32,
    },
    {
      id: "SM-568",
      platform: "Facebook",
      content: "Limited time offer: 20% off all accessories",
      status: "Scheduled",
      scheduledDate: "2023-05-18",
    },
    {
      id: "SM-569",
      platform: "Twitter",
      content: "Flash sale today only! Use code FLASH25",
      status: "Published",
      publishDate: "2023-05-14",
      engagement: 178,
      likes: 45,
      comments: 12,
    },
    {
      id: "SM-570",
      platform: "TikTok",
      content: "Behind the scenes of our latest photoshoot",
      status: "Draft",
      lastEdited: "2023-05-16",
    },
  ];

  const mockBlogPosts = [
    {
      id: "BLG-890",
      title: "10 Summer Fashion Trends",
      status: "Published",
      publishDate: "2023-05-10",
      views: 1245,
      comments: 23,
      shares: 56,
    },
    {
      id: "BLG-891",
      title: "How to Choose the Perfect Headphones",
      status: "Draft",
      lastEdited: "2023-05-14",
    },
    {
      id: "BLG-892",
      title: "Sustainable Fashion: Our Commitment",
      status: "Published",
      publishDate: "2023-05-05",
      views: 980,
      comments: 18,
      shares: 42,
    },
    {
      id: "BLG-893",
      title: "Gift Guide: Father's Day Edition",
      status: "Scheduled",
      scheduledDate: "2023-05-25",
    },
  ];

  const mockPromotions = [
    {
      id: "PROMO-123",
      name: "Summer Sale",
      type: "Discount",
      value: "20% off",
      status: "Active",
      startDate: "2023-05-01",
      endDate: "2023-05-31",
      usageCount: 245,
    },
    {
      id: "PROMO-124",
      name: "Free Shipping",
      type: "Free Shipping",
      value: "Orders over $50",
      status: "Active",
      startDate: "2023-05-01",
      endDate: "2023-06-30",
      usageCount: 189,
    },
    {
      id: "PROMO-125",
      name: "WELCOME10",
      type: "Discount",
      value: "10% off first order",
      status: "Active",
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      usageCount: 567,
    },
    {
      id: "PROMO-126",
      name: "Holiday Bundle",
      type: "Bundle",
      value: "Buy 2 Get 1 Free",
      status: "Draft",
      startDate: "2023-11-15",
      endDate: "2023-12-25",
    },
  ];

  return (
    <div className="bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marketing</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Content Calendar
          </Button>
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Email Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24.5%</div>
            <p className="text-sm text-muted-foreground">Average open rate</p>
            <p className="text-sm text-green-600 mt-2">+2.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Social Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,245</div>
            <p className="text-sm text-muted-foreground">Total interactions</p>
            <p className="text-sm text-green-600 mt-2">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Blog Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3,890</div>
            <p className="text-sm text-muted-foreground">Monthly page views</p>
            <p className="text-sm text-green-600 mt-2">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Promo Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.8%</div>
            <p className="text-sm text-muted-foreground">Conversion rate</p>
            <p className="text-sm text-red-600 mt-2">-1.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email Campaigns
          </TabsTrigger>
          <TabsTrigger value="social">
            <Instagram className="mr-2 h-4 w-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Search className="mr-2 h-4 w-4" />
            SEO Tools
          </TabsTrigger>
          <TabsTrigger value="blog">
            <FileText className="mr-2 h-4 w-4" />
            Blog
          </TabsTrigger>
          <TabsTrigger value="promotions">
            <Tag className="mr-2 h-4 w-4" />
            Promotions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Email Campaigns</CardTitle>
                <CardDescription>
                  Create and manage email marketing campaigns
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Import Template
                </Button>
                <Button>
                  <Mail className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Campaign Name</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Opens</th>
                      <th className="text-left py-3 px-4">Clicks</th>
                      <th className="text-left py-3 px-4">Conversions</th>
                      <th className="text-left py-3 px-4">Revenue</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEmailCampaigns.map((campaign) => (
                      <tr
                        key={campaign.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{campaign.name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${campaign.status === "Sent" ? "bg-green-100 text-green-800" : campaign.status === "Draft" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                          >
                            {campaign.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {campaign.sentDate ||
                            campaign.lastEdited ||
                            campaign.scheduledDate}
                        </td>
                        <td className="py-3 px-4">{campaign.opens || "-"}</td>
                        <td className="py-3 px-4">{campaign.clicks || "-"}</td>
                        <td className="py-3 px-4">
                          {campaign.conversions || "-"}
                        </td>
                        <td className="py-3 px-4">{campaign.revenue || "-"}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="mr-2">
                            View
                          </Button>
                          {campaign.status !== "Sent" && (
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-2">AI Email Generator</h3>
                <p className="text-sm mb-4">
                  Generate professional marketing emails with AI, including copy
                  and layout suggestions.
                </p>
                <div className="flex gap-2">
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Generate New Email
                  </Button>
                  <Button variant="outline">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    A/B Test Generator
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Social Media Campaigns</CardTitle>
                <CardDescription>
                  Create and schedule social media content
                </CardDescription>
              </div>
              <Button>
                <Instagram className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium mb-3">Content Calendar</h3>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-md border">
                    <p className="text-muted-foreground">
                      Content calendar placeholder
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Platform Performance</h3>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-md border">
                    <p className="text-muted-foreground">
                      Performance chart placeholder
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <h3 className="font-medium mb-3">Recent Posts</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Platform</th>
                      <th className="text-left py-3 px-4">Content</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Engagement</th>
                      <th className="text-left py-3 px-4">Likes</th>
                      <th className="text-left py-3 px-4">Comments</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSocialPosts.map((post) => (
                      <tr key={post.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{post.platform}</td>
                        <td className="py-3 px-4">{post.content}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${post.status === "Published" ? "bg-green-100 text-green-800" : post.status === "Draft" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {post.publishDate ||
                            post.scheduledDate ||
                            post.lastEdited}
                        </td>
                        <td className="py-3 px-4">{post.engagement || "-"}</td>
                        <td className="py-3 px-4">{post.likes || "-"}</td>
                        <td className="py-3 px-4">{post.comments || "-"}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="mr-2">
                            View
                          </Button>
                          {post.status !== "Published" && (
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-2">AI Content Generator</h3>
                <p className="text-sm mb-4">
                  Transform product images into engaging social media content
                  with AI.
                </p>
                <div className="flex gap-2">
                  <Button>
                    <Instagram className="mr-2 h-4 w-4" />
                    Generate Social Media Images
                  </Button>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Caption Ideas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Tools</CardTitle>
              <CardDescription>
                Optimize your store for search engines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Keyword Research</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex gap-2">
                      <Input
                        placeholder="Enter a keyword to research..."
                        className="flex-1"
                      />
                      <Button>
                        <Search className="mr-2 h-4 w-4" />
                        Analyze
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recent searches: wireless headphones, premium t-shirts,
                      leather wallet
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">SEO Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40 flex items-center justify-center bg-muted rounded-md">
                      <p className="text-muted-foreground">
                        SEO performance chart placeholder
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-3">Top Keywords</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Keyword</th>
                        <th className="text-left py-3 px-4">Search Volume</th>
                        <th className="text-left py-3 px-4">Difficulty</th>
                        <th className="text-left py-3 px-4">Current Ranking</th>
                        <th className="text-left py-3 px-4">Traffic</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">wireless headphones</td>
                        <td className="py-3 px-4">12,400</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            Medium
                          </span>
                        </td>
                        <td className="py-3 px-4">#8</td>
                        <td className="py-3 px-4">245</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            Optimize
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">premium t-shirts</td>
                        <td className="py-3 px-4">5,800</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Low
                          </span>
                        </td>
                        <td className="py-3 px-4">#3</td>
                        <td className="py-3 px-4">320</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            Optimize
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">leather wallet men</td>
                        <td className="py-3 px-4">8,200</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            High
                          </span>
                        </td>
                        <td className="py-3 px-4">#15</td>
                        <td className="py-3 px-4">98</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            Optimize
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-2">AI Content Optimizer</h3>
                <p className="text-sm mb-4">
                  Generate SEO-optimized content for your product pages and blog
                  posts.
                </p>
                <div className="flex gap-2">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate SEO Content
                  </Button>
                  <Button variant="outline">
                    <Search className="mr-2 h-4 w-4" />
                    Analyze Page SEO
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Blog</CardTitle>
                <CardDescription>
                  Create and manage blog content
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Import Article
                </Button>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Views</th>
                      <th className="text-left py-3 px-4">Comments</th>
                      <th className="text-left py-3 px-4">Shares</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBlogPosts.map((post) => (
                      <tr key={post.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{post.title}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${post.status === "Published" ? "bg-green-100 text-green-800" : post.status === "Draft" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {post.publishDate ||
                            post.lastEdited ||
                            post.scheduledDate}
                        </td>
                        <td className="py-3 px-4">{post.views || "-"}</td>
                        <td className="py-3 px-4">{post.comments || "-"}</td>
                        <td className="py-3 px-4">{post.shares || "-"}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="mr-2">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-2">AI Blog Generator</h3>
                <p className="text-sm mb-4">
                  Generate engaging blog content with AI based on your products
                  and target audience.
                </p>
                <div className="flex gap-2">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Blog Post
                  </Button>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Topic Ideas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Promotions</CardTitle>
                <CardDescription>
                  Create and manage promotional campaigns
                </CardDescription>
              </div>
              <Button>
                <Tag className="mr-2 h-4 w-4" />
                Create Promotion
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Value</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Start Date</th>
                      <th className="text-left py-3 px-4">End Date</th>
                      <th className="text-left py-3 px-4">Usage</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPromotions.map((promo) => (
                      <tr key={promo.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{promo.name}</td>
                        <td className="py-3 px-4">{promo.type}</td>
                        <td className="py-3 px-4">{promo.value}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${promo.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {promo.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{promo.startDate}</td>
                        <td className="py-3 px-4">{promo.endDate}</td>
                        <td className="py-3 px-4">{promo.usageCount || "-"}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="mr-2">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-2">AI Promotion Optimizer</h3>
                <p className="text-sm mb-4">
                  Get AI recommendations for optimal discount levels and
                  promotion timing based on your sales data.
                </p>
                <div className="flex gap-2">
                  <Button>
                    <Tag className="mr-2 h-4 w-4" />
                    Generate Promotion Strategy
                  </Button>
                  <Button variant="outline">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Analyze Past Promotions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingTab;
