"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  ShoppingBag,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Mock orders data
const ordersData = [
  { id: "#1001", customer: "Rahul Sharma", email: "rahul@example.com", amount: 2499, status: "completed", date: "2026-03-13", items: 3 },
  { id: "#1002", customer: "Priya Patel", email: "priya@example.com", amount: 1899, status: "processing", date: "2026-03-13", items: 2 },
  { id: "#1003", customer: "Amit Kumar", email: "amit@example.com", amount: 3299, status: "pending", date: "2026-03-12", items: 5 },
  { id: "#1004", customer: "Sneha Gupta", email: "sneha@example.com", amount: 999, status: "completed", date: "2026-03-12", items: 1 },
  { id: "#1005", customer: "Vikram Singh", email: "vikram@example.com", amount: 4599, status: "shipped", date: "2026-03-11", items: 4 },
  { id: "#1006", customer: "Anita Desai", email: "anita@example.com", amount: 1299, status: "completed", date: "2026-03-11", items: 2 },
  { id: "#1007", customer: "Rajesh Verma", email: "rajesh@example.com", amount: 2899, status: "cancelled", date: "2026-03-10", items: 3 },
  { id: "#1008", customer: "Meera Iyer", email: "meera@example.com", amount: 3499, status: "processing", date: "2026-03-10", items: 6 },
];

const statusConfig = {
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Truck },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

function OrderStatusBadge({ status }: { status: keyof typeof statusConfig }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={`${config.color} font-medium gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export default function OrdersPage() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleAll = () => {
    if (selectedOrders.length === ordersData.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(ordersData.map(o => o.id));
    }
  };

  const filteredOrders = ordersData.filter(order => 
    order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">1,214</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="30">
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedOrders.length === ordersData.length && ordersData.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Order
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Date
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Total
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox 
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => toggleOrder(order.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {order.customer.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">{order.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.date}</TableCell>
                  <TableCell>{order.items} items</TableCell>
                  <TableCell className="font-medium">₹{order.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status as keyof typeof statusConfig} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit order</DropdownMenuItem>
                        <DropdownMenuItem>Print invoice</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Cancel order</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {ordersData.length} orders
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
