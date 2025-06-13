import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import moment from 'moment';
import 'moment/dist/locale/th';

function DashboardChart() {
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5002/report')
      .then((response) => {
        const { facultySummary } = response.data;
  
        const chartData = Object.keys(facultySummary).map((facultyKey) => ({
          name: facultyKey,  // ใช้ชื่อเต็มแทนตัวย่อ
          borrowed: Math.round(facultySummary[facultyKey].borrowed),
          quota: facultySummary[facultyKey].quota
        }));
  
        setFacultyData(chartData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        setLoading(false);
      });
  }, []);
  
  moment.locale('th');
  const currentDate = useMemo(() => {
    return moment().format('D MMMM') + ' ' + (moment().year() + 543);
  }, []);
  
  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }
  
  if (error) {
    return <div>{error}</div>;
  }
  
  // Custom Tick Component แสดงชื่อคณะ + Quota
  const renderCustomTick = (props) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`} textAnchor="middle">
        <text x={0} y={0} fontSize={12} fill="#333" dy={13}>
          {payload.value}
        </text>
        <text x={0} y={15} fontSize={12} fill="#333" dy={10}>
          ({facultyData.find(faculty => faculty.name === payload.value)?.quota || 0})
        </text>
      </g>
    );
  };
  
  return (
    <div className="h-[22rem] bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1 rounded-lg shadow-lg">
      <strong className="text-gray-700 font-medium">รายงานการยืมแยกตามคณะ</strong>
      <span className="text-sm text-gray-800 font-light">ข้อมูลเมื่อวันที่ {currentDate}</span>
      
      <div className="mt-3 w-full flex-1 text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={facultyData} margin={{ top: 20, right: 10, left: -10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name"
              tick={renderCustomTick}  
            />
            <YAxis 
              tickFormatter={(value) => Math.round(value)} 
              domain={[0, 'dataMax']}  
              tickCount={6}            
              allowDecimals={false}    
            />
            <Tooltip />
            <Bar 
              dataKey="borrowed" 
              fill="#003399" 
              barSize={30} 
              label={{ position: 'insideTop', fill: 'white', fontSize: 12 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}  

export default DashboardChart;