import React from 'react'
import Chart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

const LineChart: React.FC = () => {
  const chartOptions: ApexOptions = {
    chart: {
      height: 350,
      type: 'line',
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      },
      // Add padding to the chart area
      parentHeightOffset: 0,
      
    },
    colors: ['#3b82f6', '#8b5cf6', '#f43f5e', '#10b981'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: [3, 3, 3, 3],
      curve: 'smooth',
      dashArray: [0, 0, 0, 0]
    },
    title: {
      text: 'Platform Growth Metrics',
      align: 'left',
      margin: 10,
      style: {
        fontSize: '16px',
        fontWeight: 600
      }
    },
    grid: {
      borderColor: '#e0e0e0',
      row: {
        colors: ['transparent'],
        opacity: 0.5
      },
      padding: {
        top: 10
      }
    },
    markers: {
      size: 4
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      title: {
        text: 'Month'
      }
    },
    yaxis: {
      title: {
        text: 'Count'
      },
      min: 0
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: 0,  
      offsetX: 0, 
      itemMargin: {
        horizontal: 10,
        vertical: 0
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y: number) {
          return y.toFixed(0)
        }
      }
    },
    
  }

  const series = [
    {
      name: 'Users',
      data: [2500, 2800, 3200, 3800, 4200, 4800, 5200, 5800, 6200, 6800, 7200, 7800]
    },
    {
      name: 'Tutors',
      data: [150, 180, 200, 220, 250, 280, 300, 320, 350, 380, 400, 420]
    },
    {
      name: 'Problems',
      data: [800, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350]
    },
    {
      name: 'Courses',
      data: [40, 42, 45, 48, 50, 52, 55, 58, 60, 62, 65, 68]
    }
  ]

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
      {/* Added extra padding to the top of the container */}
      <div className="pt-2">
        <Chart
          options={chartOptions}
          series={series}
          type="line"
          height={350}
        />
      </div>
    </div>
  )
}

export default LineChart