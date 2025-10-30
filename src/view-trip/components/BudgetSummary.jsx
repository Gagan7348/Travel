import React, { useState, useEffect } from 'react';
import {
PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FaChartPie, FaWallet } from 'react-icons/fa';
import { motion } from 'framer-motion';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function BudgetSummary({ trip }) {
const [budgetData, setBudgetData] = useState([]);
const [loading, setLoading] = useState(true);
const [totalBudget, setTotalBudget] = useState(0);

// Update chart data when trip info changes
useEffect(() => {
if (trip) extractBudgetData();
}, [trip]);

// Extracts and calculates all cost categories
const extractBudgetData = () => {
setLoading(true);
try {
const budgetCategories = { Hotels: 0, Food: 0, Tickets: 0, Transport: 0 };
let total = 0;

```
  // Hotels
  if (trip.tripData?.hotels) {
    trip.tripData.hotels.forEach(hotel => {
      const price = parseInt(hotel.price?.match(/\$?\s*(\d+)/)?.[1] || 0, 10);
      if (!isNaN(price)) {
        budgetCategories.Hotels += price;
        total += price;
      }
    });
  }

  // Tickets and Transport (from itinerary)
  if (trip.tripData?.itinerary) {
    trip.tripData.itinerary.forEach(day => {
      day.plan?.forEach(place => {
        const ticket = parseInt(place.ticketPricing?.match(/\$?\s*(\d+)/)?.[1] || 0, 10);
        const transport = parseInt(place.transportCost?.match(/\$?\s*(\d+)/)?.[1] || 0, 10);
        if (!isNaN(ticket)) {
          budgetCategories.Tickets += ticket;
          total += ticket;
        }
        if (!isNaN(transport)) {
          budgetCategories.Transport += transport;
          total += transport;
        }
      });
    });
  }

  // Estimate food and transport if missing
  const days = trip.userSelection?.noOfDays || 1;
  const level = trip.userSelection?.budget || 'Moderate';
  const foodPerDay = level === 'Luxury' ? 120 : level === 'Moderate' ? 60 : 30;
  const transportPerDay = level === 'Luxury' ? 60 : level === 'Moderate' ? 30 : 15;

  budgetCategories.Food = days * foodPerDay;
  if (budgetCategories.Transport === 0) budgetCategories.Transport = days * transportPerDay;
  total += budgetCategories.Food + budgetCategories.Transport;

  // Prepare data for charts
  setBudgetData(Object.entries(budgetCategories).map(([name, value]) => ({ name, value })));
  setTotalBudget(total);
} catch (error) {
  console.error('Error extracting budget data:', error);
} finally {
  setLoading(false);
}
```

};

const formatCurrency = (v) => `$${v}`;

// Custom pie label for percentage display
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
return ( <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
{`${(percent * 100).toFixed(0)}%`} </text>
);
};

return ( <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
{/* Header */} <div className="flex items-center gap-3 mb-6"> <div className="bg-amber-100 p-2 rounded-xl"> <FaWallet className="text-amber-600 text-xl" /> </div> <h2 className="text-2xl font-bold text-gray-900">Budget Summary Breakdown</h2> </div>

```
  {/* Loading / Empty / Charts */}
  {loading ? (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  ) : budgetData.length === 0 ? (
    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <FaChartPie className="w-12 h-12 mx-auto mb-3 text-gray-400" />
      <p>No budget data available yet</p>
    </div>
  ) : (
    <div className="space-y-8">
      {/* Total */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">Total Budget:</h3>
        <div className="text-2xl font-bold text-amber-600">${totalBudget}</div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Percentage Breakdown</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={budgetData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={100} dataKey="value">
                  {budgetData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`$${v}`, 'Amount']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Category Amounts</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(v) => [`$${v}`, 'Amount']} />
                <Bar dataKey="value" fill="#8884d8">
                  {budgetData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Notes */}
      <div className="mt-6 text-sm text-gray-500">
        <p>* Food costs are estimated based on duration and budget level.</p>
        <p>* Transport includes local transfers and travel between destinations.</p>
      </div>
    </div>
  )}
</div>
```

);
}

export default BudgetSummary;
