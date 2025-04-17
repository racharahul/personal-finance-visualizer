"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
    category: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [budgets, setBudgets] = useState({
    Food: 0,
    Travel: 0,
    Rent: 0,
    Shopping: 0,
    Misc: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value) => {
    setForm((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { amount, date, description, category } = form;
    if (!amount || !date || !description || !category) {
      alert("All fields are required!");
      return;
    }

    if (isEditing) {
      const updatedTxns = transactions.map((tx) =>
        tx.id === editId ? { ...form, id: editId } : tx
      );
      setTransactions(updatedTxns);
      setIsEditing(false);
      setEditId(null);
    } else {
      const newTransaction = {
        ...form,
        id: Date.now(),
      };
      setTransactions([newTransaction, ...transactions]);
    }

    setForm({ amount: "", date: "", description: "", category: "" });
  };

  const handleEdit = (tx) => {
    setForm({
      amount: tx.amount,
      date: tx.date,
      description: tx.description,
      category: tx.category,
    });
    setEditId(tx.id);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    const confirmed = confirm(
      "Are you sure you want to delete this transaction?"
    );
    if (confirmed) {
      setTransactions(transactions.filter((tx) => tx.id !== id));
    }
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

  const getCategorySpending = () => {
    const totals = {};
    for (const category of Object.keys(budgets)) {
      totals[category] = transactions
        .filter((tx) => tx.category === category)
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
    }
    return totals;
  };

  const handleBudgetChange = (category, value) => {
    setBudgets((prev) => ({
      ...prev,
      [category]: Number(value),
    }));
  };

  const categorySpending = getCategorySpending();

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-8">
      {/* Add/Edit Transaction Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </h2>
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
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Misc">Misc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {isEditing ? "Update Transaction" : "Add Transaction"}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setForm({
                      amount: "",
                      date: "",
                      description: "",
                      category: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Budgets Section */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold">Set Monthly Budgets</h2>
          {Object.entries(budgets).map(([category, budget]) => (
            <div key={category} className="flex justify-between items-center">
              <Label>{category}</Label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => handleBudgetChange(category, e.target.value)}
                className="w-32"
                placeholder="₹"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Budget Overview */}
      <Card>
        <CardContent className="p-6 space-y-2">
          <h2 className="text-xl font-bold">Budget Overview</h2>
          {Object.keys(budgets).map((category) => {
            const spent = categorySpending[category];
            const budget = budgets[category];
            const remaining = budget - spent;
            const over = remaining < 0;

            return (
              <div key={category} className="flex justify-between text-sm">
                <span>{category}</span>
                <span>
                  ₹{spent} / ₹{budget}{" "}
                  <span className={over ? "text-red-500" : "text-green-600"}>
                    ({over ? `Over by ₹${-remaining}` : `₹${remaining} left`})
                  </span>
                </span>
              </div>
            );
          })}
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
                  className="border p-2 rounded-md flex flex-col text-sm"
                >
                  <div className="flex justify-between">
                    <span>₹{tx.amount}</span>
                    <span>{tx.date}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{tx.description}</span>
                    <span className="italic">{tx.category}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(tx)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(tx.id)}
                    >
                      Delete
                    </Button>
                  </div>
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
