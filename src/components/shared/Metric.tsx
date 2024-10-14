import React from 'react';

interface MetricProps {
  icon: React.ReactNode;
  value: number;
  title: string;
  textStyles?: string;
}

const Metric = ({ icon, value, title, textStyles = '' }: MetricProps) => (
  <div className="flex items-center gap-2">
    {icon}
    <div className={textStyles}>
      {value} {title}
    </div>
  </div>
);

export default Metric;
