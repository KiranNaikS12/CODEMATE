import React from "react";
import { useGetDashboardMetricsQuery } from "../../services/adminApiSlice";
import { Users, GraduationCap, BookOpen, School } from "lucide-react";
import LineChart from "./LineChart";


const AdminDashBoard:React.FC = () => {
  const { data: getStats } = useGetDashboardMetricsQuery('');

  const metrics = [
    {
      title: "Total Users",
      count: getStats?.data?.userCounts,
      icon: Users,
      gradient: "bg-gradient-to-br from-blue-50 to-blue-100",
      textColor: "text-blue-600",
      iconBg: "bg-blue-500/10",
    },
    {
      title: "Total Tutors",
      count: getStats?.data?.tutorCounts,
      icon: GraduationCap,
      gradient: "bg-gradient-to-br from-purple-50 to-purple-100",
      textColor: "text-purple-600",
      iconBg: "bg-purple-500/10",
    },
    {
      title: "Problems",
      count: getStats?.data?.problemCounts,
      icon: BookOpen,
      gradient: "bg-gradient-to-br from-rose-50 to-rose-100",
      textColor: "text-rose-600",
      iconBg: "bg-rose-500/10",
    },
    {
      title: "Courses",
      count: getStats?.data?.courseCounts,
      icon: School,
      gradient: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      textColor: "text-emerald-600",
      iconBg: "bg-emerald-500/10",
    },
  ];
  
  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div
              key={index}
              className={`${metric.gradient} rounded-lg p-6 shadow-sm transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${metric.textColor}`}>
                    {metric.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {metric.count}
                  </p>
                </div>
                <div className={`rounded-lg ${metric.iconBg} p-3`}>
                  <IconComponent
                    className={`h-6 w-6 ${metric.textColor}`}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">+12%</span>
                  <span className="ml-2">from last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <LineChart/>
      </div>
    </div>
  );
};

export default AdminDashBoard;
