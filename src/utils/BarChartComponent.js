
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChartComponent = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalmerchants" fill="#9333EA" name="Total Docs" />
        <Bar dataKey="pending" fill="#FFB020" name="Docs Pending" />
        <Bar dataKey="Approved" fill="#82ca9d" name="Docs Verified" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
