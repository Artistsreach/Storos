import React from 'react';
import { 
  Globe, 
  Award, 
  Users, 
  Heart, 
  Star, 
  Zap, 
  Package 
} from 'lucide-react';

const iconMap = {
  GlobeIcon: Globe,
  AwardIcon: Award,
  UsersIcon: Users,
  HeartIcon: Heart,
  StarIcon: Star,
  ZapIcon: Zap,
  PackageIcon: Package,
};

const Icon = ({ name, size = 24, className = '' }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    return null;
  }

  return <IconComponent size={size} className={className} />;
};

export default Icon;
