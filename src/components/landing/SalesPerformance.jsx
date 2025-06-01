import { TrendingUp, ShoppingCart, Users, Zap, Eye, BarChart3, PieChart, LineChart } from "lucide-react";
import { Card, CardContent } from "components/ui/card";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from "recharts";

const SalesPerformance = () => {
  const conversionData = [
    { month: 'Jan', traditional: 2.1, ai: 3.8 },
    { month: 'Feb', traditional: 2.3, ai: 4.2 },
    { month: 'Mar', traditional: 2.0, ai: 4.5 },
    { month: 'Apr', traditional: 2.4, ai: 4.8 },
    { month: 'May', traditional: 2.2, ai: 5.1 },
    { month: 'Jun', traditional: 2.5, ai: 5.4 }
  ];

  const revenueData = [
    { feature: 'AI Personalization', increase: 35 },
    { feature: 'Product Visualizers', increase: 200 },
    { feature: 'AI Chatbots', increase: 67 },
    { feature: 'Instant Stores', increase: 70 }
  ];

  const performanceData = [
    { name: 'Conversion Rate', value: 45, color: '#10b981' },
    { name: 'Customer LTV', value: 50, color: '#3b82f6' },
    { name: 'Reduced CAC', value: 35, color: '#8b5cf6' },
    { name: 'Session Duration', value: 60, color: '#f59e0b' }
  ];

  const stats = [
    {
      icon: <TrendingUp className="w-8 h-8 text-emerald-600" />,
      title: "AI Personalization",
      increase: "10-35%",
      description: "Revenue increase through dynamic product recommendations and personalized experiences",
      details: ["10-15% conversion rate boost", "6x higher email transaction rates", "70% to 45% cart abandonment reduction"],
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      icon: <Eye className="w-8 h-8 text-blue-600" />,
      title: "AI Product Visualizers",
      increase: "40-200%",
      description: "Conversion rate increase with visual commerce and AI experiences",
      details: ["20-30% return rate reduction", "60-80% engagement time boost", "11x purchase likelihood increase"],
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "AI Chatbot Assistants",
      increase: "67%",
      description: "Sales conversion increase with 24/7 intelligent customer support",
      details: ["80% routine inquiries handled", "15-25% average order value boost", "7x conversion with <1min response"],
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: <Zap className="w-8 h-8 text-orange-600" />,
      title: "Instant Store Generation",
      increase: "70%",
      description: "Lower upfront costs with AI-powered rapid deployment",
      details: ["Hours vs months setup time", "200-400% revenue growth potential", "3-5x faster scaling with managers"],
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  const overallStats = [
    { metric: "25-45%", label: "Overall Conversion Rate Increase", icon: <BarChart3 className="w-6 h-6" /> },
    { metric: "30-50%", label: "Customer Lifetime Value Improvement", icon: <LineChart className="w-6 h-6" /> },
    { metric: "20-35%", label: "Customer Acquisition Cost Reduction", icon: <TrendingUp className="w-6 h-6" /> },
    { metric: "40-60%", label: "Average Session Duration Increase", icon: <PieChart className="w-6 h-6" /> }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Simplified AI Storefronts Increase Sales Performance
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            AI-powered product visualizers, personalization, and chatbot assistants dramatically boost 
            add-to-cart rates and purchases for entrepreneurs and store owners.
          </p>
        </div>

        {/* Interactive Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Conversion Rate Chart */}
          <Card className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <LineChart className="w-6 h-6 text-emerald-600" />
                Conversion Rate Comparison
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsLineChart data={conversionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }} 
                  />
                  <Line type="monotone" dataKey="traditional" stroke="#94a3b8" strokeWidth={2} name="Traditional" />
                  <Line type="monotone" dataKey="ai" stroke="#10b981" strokeWidth={3} name="AI-Powered" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Increase Chart */}
          <Card className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Revenue Increase by Feature
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="feature" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }} 
                  />
                  <Bar dataKey="increase" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Main Stats Grid - Compact Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-md bg-white/80 border border-white/30 shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-5 text-center">
                <div className="mb-3 flex justify-center">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors duration-300">
                  {stat.increase}
                </div>
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  {stat.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                  {stat.description}
                </p>
                <div className="space-y-1">
                  {stat.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                      {detail}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Combined Performance Stats & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overall Stats */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-md bg-gradient-to-r from-emerald-500 to-emerald-600 border-0 text-white shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-3">Combined AI Performance Impact</h3>
                  <p className="text-emerald-100 text-base">
                    Businesses using comprehensive AI e-commerce solutions report significant improvements across all key metrics
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {overallStats.map((stat, index) => (
                    <div key={index} className="text-center backdrop-blur-sm bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
                      <div className="flex justify-center mb-2 text-emerald-100">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.metric}</div>
                      <div className="text-emerald-100 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Pie Chart */}
          <Card className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Performance Metrics
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }} 
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {performanceData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600">{item.name}: +{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success Story */}
        <div className="mt-12 animate-fade-in delay-500">
          <Card className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Multi-Store Success Strategy</h3>
              <p className="text-gray-600 leading-relaxed max-w-4xl mx-auto text-center">
                Successful entrepreneurs using AI store builders often create 10-15 stores within their first year, 
                with 2-3 becoming primary revenue generators. Store managers can focus on marketing and customer 
                relationships while AI handles product curation, pricing optimization, and basic operations, 
                resulting in 3-5x faster growth compared to solo-operated stores.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SalesPerformance;
