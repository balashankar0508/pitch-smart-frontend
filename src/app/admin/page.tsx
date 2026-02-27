"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, Users, Key, Phone, Save, Loader2 } from "lucide-react"
import axios from "axios"

interface Customer {
    id: number;
    businessName: string;
    wabaId: string;
    phoneNumberId: string;
    accessToken: string;
    phone: string;
    email: string;
    subscriptionPlan: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalLeads: 0,
        totalUsers: 0,
        monthlyRevenue: 0,
        avgRevenuePerUser: 0
    })
    const [isAdding, setIsAdding] = useState(false)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        businessName: "",
        wabaId: "",
        phoneNumberId: "",
        accessToken: "",
        phone: "",
        email: "",
        subscriptionPlan: "Starter"
    })

    useEffect(() => {
        fetchCustomers()
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/admin/analytics/overview")
            setStats(res.data)
        } catch (e) {
            console.error("Failed to load stats", e)
        }
    }

    const fetchCustomers = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/customers")
            setCustomers(Array.isArray(res.data) ? res.data : [])
        } catch (e) {
            console.error("Failed to load customers", e)
            setCustomers([])
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await axios.post("http://localhost:8080/api/customers", formData)
            setIsAdding(false)
            fetchCustomers() // Refresh list
            setFormData({ businessName: "", wabaId: "", phoneNumberId: "", accessToken: "", phone: "", email: "", subscriptionPlan: "Starter" })
        } catch (e) {
            console.error("Failed to save customer", e)
            alert("Error saving customer. See console.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Super Admin</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> Onboard Tenant</>}
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <span className="text-indigo-600 font-bold">$</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Estimated from plans</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Across all tenants</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                        <p className="text-xs text-muted-foreground">WABA Onboarded</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">API Health</CardTitle>
                        <Key className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">Operational</div>
                        <p className="text-xs text-muted-foreground">Meta Cloud Status</p>
                    </CardContent>
                </Card>
            </div>

            {isAdding && (
                <Card className="border-primary/50 shadow-md">
                    <CardHeader>
                        <CardTitle>Onboard New Tenant (WABA Client)</CardTitle>
                        <CardDescription>
                            Enter the WhatsApp Business API details from the Meta Developer Dashboard to provision a new client.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <Input id="businessName" name="businessName" placeholder="e.g. Acme Assisted Living" required value={formData.businessName} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Client Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="admin@acme.com" required value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="wabaId">WhatsApp Business Account ID</Label>
                                    <Input id="wabaId" name="wabaId" placeholder="e.g. 2008684..." required value={formData.wabaId} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                                    <Input id="phoneNumberId" name="phoneNumberId" placeholder="e.g. 964152..." required value={formData.phoneNumberId} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label htmlFor="accessToken">Permanent / System Access Token</Label>
                                    <Input id="accessToken" name="accessToken" placeholder="EAAT6mnruZ..." required value={formData.accessToken} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                                    <select
                                        name="subscriptionPlan"
                                        id="subscriptionPlan"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.subscriptionPlan}
                                        onChange={(e: any) => handleInputChange(e)}
                                    >
                                        <option value="Starter">Starter (500 Leads)</option>
                                        <option value="Growth">Growth (2,000 Leads)</option>
                                        <option value="Pro">Pro (Unlimited)</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save and Provision
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Tenant Roster</CardTitle>
                    <CardDescription>All companies currently active on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business Name</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>WABA ID</TableHead>
                                    <TableHead>Phone Number ID</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No tenants found.</TableCell>
                                    </TableRow>
                                ) : (
                                    customers.map((c: Customer) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">{c.businessName || "Unknown"}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{c.subscriptionPlan || "Starter"}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs font-mono">{c.wabaId}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs font-mono">{c.phoneNumberId}</TableCell>
                                            <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
