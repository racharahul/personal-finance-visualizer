"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TransactionTracker() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    date: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.date || !form.description) {
      alert("All fields are required!");
      return;
    }

    const newTransaction = {
      ...form,
      id: Date.now(),
    };

    setTransactions([newTransaction, ...transactions]);
    setForm({ amount: "", date: "", description: "" });
  };

  const getMonthlyTotals = (transactions) => {
    const grouped = {};

    transactions.forEach((tx) => {
      const month = new Date(tx.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!grouped[month]) {
        grouped[month] = 0;
      }
      grouped[month] += Number(tx.amount);
    });

    return Object.entries(grouped).map(([month, total]) => ({ month, total }));
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-8">
      {/* Add Transaction Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Add Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Grocery shopping"
              />
            </div>
            <Button type="submit">Add Transaction</Button>
          </form>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Transactions</h2>
          {transactions.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <ul className="space-y-2">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="border p-2 rounded-md flex justify-between text-sm"
                >
                  <span>₹{tx.amount}</span>
                  <span>{tx.date}</span>
                  <span>{tx.description}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Monthly Bar Chart */}
      {transactions.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Monthly Expenses</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={getMonthlyTotals(transactions)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#8884d8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
