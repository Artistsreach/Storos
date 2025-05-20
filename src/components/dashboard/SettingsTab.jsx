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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  CreditCard,
  Globe,
  FileText,
  Save,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext"; // Import useStore

const SettingsTab = ({ store }) => { // Accept store as a prop
  const [activeSubTab, setActiveSubTab] = useState("store");
  const { user, session, subscriptionStatus } = useAuth();
  const { updateStore, isLoadingStores } = useStore(); // Get updateStore from context
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);
  const [copied, setCopied] = useState(false);

  const isSubscribed = subscriptionStatus === "active";

  const handleManageBilling = async () => {
    if (!session?.access_token) {
      setPortalError("Authentication token not found. Please log in again.");
      return;
    }
    setIsPortalLoading(true);
    setPortalError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create portal session.");
      }
      window.location.href = data.url;
    } catch (err) {
      console.error("Portal session error:", err);
      setPortalError(err.message);
    } finally {
      setIsPortalLoading(false);
    }
  };

  const handleCopySubdomain = () => {
    // This should ideally get the store's actual subdomain
    // For now, using a placeholder.
    const storeSubdomain = user?.store?.subdomain || "your-store";
    navigator.clipboard.writeText(`${storeSubdomain}.storegen.app`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="store">
            <Settings className="mr-2 h-4 w-4" />
            Store Details
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="domain">
            <Globe className="mr-2 h-4 w-4" />
            Domain Management
          </TabsTrigger>
          <TabsTrigger value="legal">
            <FileText className="mr-2 h-4 w-4" />
            Legal Pages
          </TabsTrigger>
          <TabsTrigger value="footer">
            <FileText className="mr-2 h-4 w-4" />
            Footer Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Details</CardTitle>
              <CardDescription>
                Update your store information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Store Name</Label>
                    <Input
                      id="store-name"
                      placeholder="Your Store Name"
                      defaultValue="My Awesome Store"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-email">Store Email</Label>
                    <Input
                      id="store-email"
                      type="email"
                      placeholder="contact@yourstore.com"
                      defaultValue={user?.email || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Store Phone</Label>
                    <Input
                      id="store-phone"
                      placeholder="+1 (555) 123-4567"
                      defaultValue="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-address">Store Address</Label>
                    <Textarea
                      id="store-address"
                      placeholder="123 Main St, City, State, ZIP"
                      defaultValue="123 Main St\nNew York, NY 10001\nUnited States"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="store-currency">Currency</Label>
                      <select
                        id="store-currency"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        defaultValue="USD"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store-timezone">Timezone</Label>
                      <select
                        id="store-timezone"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        defaultValue="America/New_York"
                      >
                        <option value="America/New_York">
                          Eastern Time (ET)
                        </option>
                        <option value="America/Chicago">
                          Central Time (CT)
                        </option>
                        <option value="America/Denver">
                          Mountain Time (MT)
                        </option>
                        <option value="America/Los_Angeles">
                          Pacific Time (PT)
                        </option>
                        <option value="Europe/London">London (GMT)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-description">Store Description</Label>
                  <Textarea
                    id="store-description"
                    placeholder="Tell customers about your store..."
                    defaultValue="Welcome to My Awesome Store! We offer high-quality products at competitive prices. Our mission is to provide exceptional customer service and a seamless shopping experience."
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enable-reviews" defaultChecked />
                  <Label htmlFor="enable-reviews">
                    Enable customer reviews
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enable-inventory" defaultChecked />
                  <Label htmlFor="enable-inventory">
                    Show inventory warnings on product pages
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="enable-tax" defaultChecked />
                  <Label htmlFor="enable-tax">
                    Enable automatic tax calculation
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="enable-store-theme-toggle" 
                    checked={store?.settings?.showThemeToggle ?? true} // Read from store settings, default to true
                    onCheckedChange={(checked) => {
                      if (store && updateStore) {
                        updateStore(store.id, { 
                          settings: { ...store.settings, showThemeToggle: checked } 
                        });
                      }
                    }}
                    disabled={isLoadingStores || !store}
                  />
                  <Label htmlFor="enable-store-theme-toggle">
                    Show theme (light/dark) toggle in store header
                  </Label>
                </div>
              </div>

              <Button className="mt-6" disabled={isLoadingStores || !store}>
                <Save className="mr-2 h-4 w-4" />
                Save Store Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your subscription and payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-medium">
                      {isSubscribed ? "Store Creator Plan" : "Free Plan"}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isSubscribed
                        ? "$29.99/month, billed monthly"
                        : "Limited features"}
                    </p>
                    <div className="mt-4">
                      {isSubscribed ? (
                        <Button
                          onClick={handleManageBilling}
                          disabled={isPortalLoading}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {isPortalLoading
                            ? "Loading..."
                            : "Manage Subscription"}
                        </Button>
                      ) : (
                        <Button onClick={handleManageBilling} disabled={isPortalLoading}> {/* Assuming upgrade also goes to portal */}
                          <CreditCard className="mr-2 h-4 w-4" />
                           {isPortalLoading ? "Loading..." : "Upgrade to Pro"}
                        </Button>
                      )}
                      {portalError && (
                        <p className="text-sm text-red-500 mt-2">
                          {portalError}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSubscribed ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-md mr-3">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Visa ending in 4242</p>
                              <p className="text-sm text-muted-foreground">
                                Expires 12/2025
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={isPortalLoading}>
                            Edit
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleManageBilling}
                          disabled={isPortalLoading}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {isPortalLoading
                            ? "Loading..."
                            : "Add Payment Method"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">
                          No payment methods available.
                          <br />
                          Upgrade to add payment methods.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isSubscribed ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Date</th>
                            <th className="text-left py-3 px-4">Description</th>
                            <th className="text-left py-3 px-4">Amount</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">May 1, 2023</td>
                            <td className="py-3 px-4">Store Creator Plan</td>
                            <td className="py-3 px-4">$29.99</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                Paid
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                            </td>
                          </tr>
                          <tr className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">Apr 1, 2023</td>
                            <td className="py-3 px-4">Store Creator Plan</td>
                            <td className="py-3 px-4">$29.99</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                Paid
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">
                        No billing history available.
                        <br />
                        Upgrade to view billing history.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain">
          <Card>
            <CardHeader>
              <CardTitle>Domain Management</CardTitle>
              <CardDescription>
                Configure your store's domain and URL settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Subdomain</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Input defaultValue={user?.store?.subdomain || "your-store"} className="flex-grow" />
                      <span className="text-muted-foreground">
                        .storegen.app
                      </span>
                    </div>
                    <div className="flex justify-between mt-4">
                      <Button>
                        <Save className="mr-2 h-4 w-4" />
                        Save Subdomain
                      </Button>
                      <Button variant="outline" onClick={handleCopySubdomain}>
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" /> Copy URL
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Custom Domain</CardTitle>
                    {!isSubscribed && (
                      <CardDescription>
                        <span className="text-yellow-600">
                          Available on paid plans only
                        </span>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {isSubscribed ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="yourdomain.com"
                            className="flex-grow"
                          />
                          <Button>
                            <Globe className="mr-2 h-4 w-4" />
                            Connect
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Enter your domain name without http:// or www.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 space-y-4">
                        <p className="text-muted-foreground text-center">
                          Custom domains are available on paid plans only.
                        </p>
                        <Button onClick={handleManageBilling} disabled={isPortalLoading}>
                          <CreditCard className="mr-2 h-4 w-4" />
                          {isPortalLoading ? "Loading..." : "Upgrade to Pro"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {isSubscribed && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">DNS Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm">
                        To connect your custom domain, add these DNS records in
                        your domain provider's dashboard:
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4">Type</th>
                              <th className="text-left py-3 px-4">Name</th>
                              <th className="text-left py-3 px-4">Value</th>
                              <th className="text-left py-3 px-4">TTL</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">CNAME</td>
                              <td className="py-3 px-4">@</td>
                              <td className="py-3 px-4">
                                {user?.store?.subdomain || "your-store"}.storegen.app
                              </td>
                              <td className="py-3 px-4">3600</td>
                            </tr>
                            <tr className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4">CNAME</td>
                              <td className="py-3 px-4">www</td>
                              <td className="py-3 px-4">
                                {user?.store?.subdomain || "your-store"}.storegen.app
                              </td>
                              <td className="py-3 px-4">3600</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-between">
                        <Button variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          View DNS Guide
                        </Button>
                        <Button>
                          <Globe className="mr-2 h-4 w-4" />
                          Verify DNS
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Legal Pages</CardTitle>
              <CardDescription>
                Configure your store's legal documents and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Privacy Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4 h-64 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <h4>Privacy Policy</h4>
                          <p>
                            This Privacy Policy describes how your personal
                            information is collected, used, and shared when you
                            visit or make a purchase from our store.
                          </p>
                          <h5>Personal Information We Collect</h5>
                          <p>
                            When you visit the Site, we automatically collect
                            certain information about your device, including
                            information about your web browser, IP address, time
                            zone, and some of the cookies that are installed on
                            your device.
                          </p>
                          <p>
                            Additionally, as you browse the Site, we collect
                            information about the individual web pages or
                            products that you view, what websites or search
                            terms referred you to the Site, and information
                            about how you interact with the Site.
                          </p>
                          <h5>How We Use Your Personal Information</h5>
                          <p>
                            We use the information that we collect generally to
                            fulfill any orders placed through the Site
                            (including processing your payment information,
                            arranging for shipping, and providing you with
                            invoices and/or order confirmations).
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <Button>
                          <FileText className="mr-2 h-4 w-4" />
                          Edit Privacy Policy
                        </Button>
                        <Button variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          Generate with AI
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Terms of Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4 h-64 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <h4>Terms of Service</h4>
                          <p>
                            These Terms of Service govern your use of our
                            website and the products and services provided by
                            us.
                          </p>
                          <h5>Overview</h5>
                          <p>
                            By accessing our website, you agree to these Terms
                            of Service. If you do not agree with any part of
                            these terms, you may not access the website or use
                            our services.
                          </p>
                          <h5>Products and Services</h5>
                          <p>
                            All products and services displayed on our website
                            are subject to availability. We reserve the right to
                            discontinue any product or service at any time.
                          </p>
                          <h5>Accuracy of Information</h5>
                          <p>
                            We make every effort to ensure that the information
                            on our website is accurate and up-to-date. However,
                            we do not warrant that product descriptions or other
                            content is accurate, complete, reliable, current, or
                            error-free.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <Button>
                          <FileText className="mr-2 h-4 w-4" />
                          Edit Terms of Service
                        </Button>
                        <Button variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          Generate with AI
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Refund Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4 h-64 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <h4>Refund Policy</h4>
                          <p>
                            We offer a 30-day return policy for most items. To
                            be eligible for a return, your item must be unused
                            and in the same condition that you received it.
                          </p>
                          <h5>Return Process</h5>
                          <p>
                            1. Contact our customer service team
                            <br />
                            2. Receive a Return Merchandise Authorization (RMA)
                            number
                            <br />
                            3. Ship the item back with the RMA number clearly
                            marked
                            <br />
                            4. Once received, we will process your refund within
                            5-7 business days
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
                      <div className="flex justify-between">
                        <Button>
                          <FileText className="mr-2 h-4 w-4" />
                          Edit Refund Policy
                        </Button>
                        <Button variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          Generate with AI
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cookie Policy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4 h-64 overflow-y-auto">
                        <div className="prose prose-sm max-w-none">
                          <h4>Cookie Policy</h4>
                          <p>
                            This Cookie Policy explains how we use cookies and
                            similar technologies to recognize you when you visit
                            our website.
                          </p>
                          <h5>What are cookies?</h5>
                          <p>
                            Cookies are small data files that are placed on your
                            computer or mobile device when you visit a website.
                            Cookies are widely used by website owners in order
                            to make their websites work, or to work more
                            efficiently, as well as to provide reporting
                            information.
                          </p>
                          <h5>How we use cookies</h5>
                          <p>
                            We use cookies for several reasons. Some cookies are
                            required for technical reasons in order for our
                            website to operate, and we refer to these as
                            "essential" or "strictly necessary" cookies. Other
                            cookies enable us to track and target the interests
                            of our users to enhance the experience on our
                            website.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <Button>
                          <FileText className="mr-2 h-4 w-4" />
                          Edit Cookie Policy
                        </Button>
                        <Button variant="outline">
                          <FileText className="mr-2 h-4 w-4" />
                          Generate with AI
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer Editor</CardTitle>
              <CardDescription>
                Customize your store's footer information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="footer-email">Email</Label>
                        <Input
                          id="footer-email"
                          type="email"
                          placeholder="contact@yourstore.com"
                          defaultValue={user?.email || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-phone">Phone</Label>
                        <Input
                          id="footer-phone"
                          placeholder="+1 (555) 123-4567"
                          defaultValue="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-address">Address</Label>
                        <Textarea
                          id="footer-address"
                          placeholder="123 Main St, City, State, ZIP"
                          defaultValue="123 Main St\nNew York, NY 10001\nUnited States"
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Business Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="footer-hours">Hours of Operation</Label>
                        <Textarea
                          id="footer-hours"
                          placeholder="Monday-Friday: 9am-5pm"
                          defaultValue="Monday-Friday: 9am-5pm\nSaturday: 10am-4pm\nSunday: Closed"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-support">
                          Customer Support Hours
                        </Label>
                        <Textarea
                          id="footer-support"
                          placeholder="Monday-Friday: 9am-5pm"
                          defaultValue="Monday-Friday: 9am-6pm\nSaturday: 10am-2pm\nSunday: Closed"
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Social Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="footer-facebook">Facebook</Label>
                        <Input
                          id="footer-facebook"
                          placeholder="https://facebook.com/yourstore"
                          defaultValue="https://facebook.com/yourstore"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-instagram">Instagram</Label>
                        <Input
                          id="footer-instagram"
                          placeholder="https://instagram.com/yourstore"
                          defaultValue="https://instagram.com/yourstore"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="footer-twitter">Twitter</Label>
                        <Input
                          id="footer-twitter"
                          placeholder="https://twitter.com/yourstore"
                          defaultValue="https://twitter.com/yourstore"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">About Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="footer-about">About Us Text</Label>
                      <Textarea
                        id="footer-about"
                        placeholder="Tell customers about your business..."
                        defaultValue="My Awesome Store was founded in 2023 with a mission to provide high-quality products at competitive prices. We are committed to exceptional customer service and a seamless shopping experience."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footer-copyright">Copyright Text</Label>
                      <Input
                        id="footer-copyright"
                        placeholder="© 2023 Your Store. All rights reserved."
                        defaultValue={`© ${new Date().getFullYear()} My Awesome Store. All rights reserved.`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Footer Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsTab;
