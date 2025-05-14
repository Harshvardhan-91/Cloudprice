// constants.js
export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Explore', path: '/explore' },
  { name: 'Contact', path: '/contact' },
];

export const CLOUD_PROVIDERS = [
  { 
    name: 'AWS', 
    fullName: 'Amazon Web Services',
    logo: '🔶',
    regions: ['us-east-1', 'us-west-1', 'eu-west-1', 'ap-southeast-1']
  },
  { 
    name: 'Azure', 
    fullName: 'Microsoft Azure',
    logo: '🔷',
    regions: ['eastus', 'westus', 'northeurope', 'southeastasia']
  },
  { 
    name: 'GCP', 
    fullName: 'Google Cloud Platform',
    logo: '🌈',
    regions: ['us-central1', 'us-west1', 'europe-west1', 'asia-east1']
  }
];

export const PRICING_STATS = [
  { value: '3+', label: 'Cloud Providers' },
  { value: '50+', label: 'Regions' },
  { value: '1000+', label: 'Instance Types' },
  { value: '99.9%', label: 'Price Accuracy' }
];

export const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'CTO at TechStart',
    content: 'CloudPrice helped us reduce our cloud costs by 40% in just two months. The comparison tool is incredibly intuitive.',
    avatar: '👩‍💼'
  },
  {
    name: 'Michael Chen',
    role: 'Cloud Architect',
    content: 'As someone who works with multiple cloud providers daily, this tool has become essential for optimization decisions.',
    avatar: '👨‍💻'
  },
  {
    name: 'Emma Rodriguez',
    role: 'DevOps Lead at ScaleUp',
    content: 'The real-time pricing updates and filtering options save my team countless hours of research every month.',
    avatar: '👩‍🔧'
  }
];

export const FEATURES_DETAILED = [
  {
    title: 'Real-Time Price Sync',
    description: 'Automatic price updates from AWS, Azure, and GCP every 3-7 days to keep you informed of the latest pricing changes.',
    icon: 'Refresh'
  },
  {
    title: 'Advanced Filtering',
    description: 'Filter by provider, region, vCPUs, RAM, and more to find exactly what you need for your workloads.',
    icon: 'Filter'
  },
  {
    title: 'Visual Analytics',
    description: 'Interactive charts and graphs help you visualize price comparisons and identify cost optimization opportunities.',
    icon: 'BarChart'
  },
  {
    title: 'Cost Optimization',
    description: 'Automatically identify the most cost-effective instances for your specific requirements across all providers.',
    icon: 'TrendingDown'
  },
  {
    title: 'Region Comparison',
    description: 'Compare prices across different regions to find the most economical location for your workloads.',
    icon: 'Globe'
  },
  {
    title: 'Customizable Dashboard',
    description: 'Create your own dashboard with the metrics and comparisons that matter most to your organization.',
    icon: 'LayoutDashboard'
  }
];