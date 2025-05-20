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
import { CreditCard, Calendar, AlertTriangle, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth

const PaymentsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("transactions");
  const { session, user } = useAuth(); // Get session and user from AuthContext
  const [isConnectLoading, setIsConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState(null);

  const handleCreateConnectAccount = async () => {
    if (!session?.access_token || !user) {
      setConnectError("Authentication token not found. Please log in again.");
      return;
    }
    setIsConnectLoading(true);
    setConnectError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-connect-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ record: { id: user.id, email: user.email } }), // Add user data to the body
        },
      );
      const data = await response.json();
      if (!response.ok) {
        // Attempt to parse error from Stripe or function
        const errorDetail = data.error || (data.data && data.data.error) || "Failed to create Stripe Connect account link.";
        throw new Error(errorDetail);
      }
      if (data.account_link_url) { // Check for account_link_url specifically
        window.location.href = data.account_link_url;
      } else if (data.url) { // Fallback for general url if specific one isn't present
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned from Stripe Connect account creation.");
      }
    } catch (err) {
      console.error("Stripe Connect account creation error:", err);
      setConnectError(err.message);
    } finally {
      setIsConnectLoading(false);
    }
  };

  // Mock data for demonstration
  const mockTransactions = [
    {
      id: "TRX-1234",
      orderId: "ORD-1234",
      customer: "John Doe",
      date: "2023-05-15",
      amount: "$129.99",
      status: "Completed",
      method: "Credit Card",
    },
    {
      id: "TRX-1235",
      orderId: "ORD-1235",
      customer: "Jane Smith",
      date: "2023-05-14",
      amount: "$89.50",
      status: "Completed",
      method: "PayPal",
    },
    {
      id: "TRX-1236",
      orderId: "ORD-1236",
      customer: "Robert Johnson",
      date: "2023-05-13",
      amount: "$210.75",
      status: "Pending",
      method: "Credit Card",
    },
  ];

  const mockPayouts = [
    {
      id: "PAY-567",
      date: "2023-05-15",
      amount: "$1,245.75",
      status: "Completed",
      destination: "Bank Account (****1234)",
    },
    {
      id: "PAY-568",
      date: "2023-05-01",
      amount: "$980.50",
      status: "Completed",
      destination: "Bank Account (****1234)",
    },
    {
      id: "PAY-569",
      scheduledDate: "2023-06-01",
      estimatedAmount: "$1,500.00",
      status: "Scheduled",
      destination: "Bank Account (****1234)",
    },
  ];

  const mockDisputes = [
    {
      id: "DSP-890",
      transactionId: "TRX-1230",
      customer: "Sarah Wilson",
      date: "2023-05-10",
      amount: "$65.00",
      reason: "Item not received",
      status: "Under Review",
    },
    {
      id: "DSP-891",
      transactionId: "TRX-1228",
      customer: "David Miller",
      date: "2023-05-09",
      amount: "$120.50",
      reason: "Unauthorized charge",
      status: "Lost",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Payments & Payouts</h1>

      <Tabs
        value={activeSubTab}
        onValueChange={setActiveSubTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6"> {/* Updated to grid-cols-4 */}
          <TabsTrigger value="overview"> {/* Added Overview Tab */}
            <ExternalLink className="mr-2 h-4 w-4" />
            Connect Account
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <CreditCard className="mr-2 h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <Calendar className="mr-2 h-4 w-4" />
            Payout Schedule
          </TabsTrigger>
          <TabsTrigger value="disputes">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Disputes & Chargebacks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"> {/* Added Overview Tab Content */}
          <Card>
            <CardHeader>
              <CardTitle>Connect Stripe Account</CardTitle>
              <CardDescription>
                Connect your Stripe account to start accepting payments and manage payouts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateConnectAccount} 
                disabled={isConnectLoading}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {isConnectLoading ? "Connecting..." : "Connect with Stripe"}
              </Button>
              {connectError && (
                <p className="text-sm text-red-500 mt-2">{connectError}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>View all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Transaction ID</th>
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Method</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{transaction.id}</td>
                        <td className="py-3 px-4">{transaction.orderId}</td>
                        <td className="py-3 px-4">{transaction.customer}</td>
                        <td className="py-3 px-4">{transaction.date}</td>
                        <td className="py-3 px-4">{transaction.amount}</td>
                        <td className="py-3 px-4">{transaction.method}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${transaction.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {transaction.status}
                          </span>
                        </td>
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

        <TabsContent value="payouts">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payout Schedule</CardTitle>
                <CardDescription>
                  Manage your payout schedule and instant transfers
                </CardDescription>
              </div>
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Instant Transfer
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Current Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">$1,845.75</div>
                    <p className="text-sm text-muted-foreground">
                      Available for payout
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Next Payout</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">$1,500.00</div>
                    <p className="text-sm text-muted-foreground">
                      Scheduled for June 1, 2023
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Payout Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-medium">Monthly</div>
                    <p className="text-sm text-muted-foreground">
                      Every 1st of the month
                    </p>
                    <Button variant="link" className="p-0 mt-2">
                      Change schedule
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="overflow-x-auto">
                <h3 className="font-medium mb-3">Payout History</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Payout ID</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Destination</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPayouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{payout.id}</td>
                        <td className="py-3 px-4">
                          {payout.date || payout.scheduledDate}
                        </td>
                        <td className="py-3 px-4">
                          {payout.amount || payout.estimatedAmount}
                        </td>
                        <td className="py-3 px-4">{payout.destination}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${payout.status === "Completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                          >
                            {payout.status}
                          </span>
                        </td>
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

        <TabsContent value="disputes">
          <Card>
            <CardHeader>
              <CardTitle>Disputes & Chargebacks</CardTitle>
              <CardDescription>
                Manage payment disputes and chargebacks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Dispute ID</th>
                      <th className="text-left py-3 px-4">Transaction ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Reason</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">AI Analysis</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDisputes.map((dispute) => (
                      <tr
                        key={dispute.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-4">{dispute.id}</td>
                        <td className="py-3 px-4">{dispute.transactionId}</td>
                        <td className="py-3 px-4">{dispute.customer}</td>
                        <td className="py-3 px-4">{dispute.date}</td>
                        <td className="py-3 px-4">{dispute.amount}</td>
                        <td className="py-3 px-4">{dispute.reason}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${dispute.status === "Under Review" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                          >
                            {dispute.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {dispute.status === "Under Review" ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              High chance of winning
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              Insufficient evidence
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" className="mr-2">
                            View
                          </Button>
                          {dispute.status === "Under Review" && (
                            <Button variant="default" size="sm">
                              Respond
                            </Button>
                          )}
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

export default PaymentsTab;
