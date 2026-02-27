"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, UserPlus, Loader2, Mail, Shield, User, Users } from "lucide-react"
import axios from "axios"
import { useAuth } from "@/components/AuthProvider"

interface Team {
    id: number;
    name: string;
    leaderId?: number;
}

interface StaffMember {
    id: number;
    name: string;
    email: string;
    role: string;
    team?: {
        id: number;
        name: string;
    }
}

export default function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState<StaffMember[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [isAddingUser, setIsAddingUser] = useState(false)
    const [isAddingTeam, setIsAddingTeam] = useState(false)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [userFormData, setUserFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "TEAM_MEMBER",
        teamId: ""
    })

    const [teamFormData, setTeamFormData] = useState({
        name: "",
        leaderId: ""
    })

    useEffect(() => {
        if (user?.customerId) {
            fetchData()
        }
    }, [user?.customerId])

    const fetchData = async () => {
        try {
            const [usersRes, teamsRes] = await Promise.all([
                axios.get(`http://localhost:8080/api/users/customer/${user?.customerId}`),
                axios.get(`http://localhost:8080/api/users/teams/${user?.customerId}`)
            ])
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : [])
            setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : [])
        } catch (e) {
            console.error("Failed to load team data", e)
        } finally {
            setLoading(false)
        }
    }

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await axios.post("http://localhost:8080/api/users", {
                ...userFormData,
                customerId: user?.customerId
            })
            setIsAddingUser(false)
            fetchData()
            setUserFormData({ name: "", email: "", password: "", role: "TEAM_MEMBER", teamId: "" })
        } catch (e: any) {
            alert(e.response?.data?.error || "Failed to add user")
        } finally {
            setSubmitting(false)
        }
    }

    const handleTeamSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await axios.post("http://localhost:8080/api/users/teams", {
                ...teamFormData,
                customerId: user?.customerId
            })
            setIsAddingTeam(false)
            fetchData()
            setTeamFormData({ name: "", leaderId: "" })
        } catch (e: any) {
            alert(e.response?.data?.error || "Failed to create team")
        } finally {
            setSubmitting(false)
        }
    }

    const deleteUser = async (id: number) => {
        if (!confirm("Are you sure?")) return
        try {
            await axios.delete(`http://localhost:8080/api/users/${id}`)
            fetchData()
        } catch (e) {
            console.error("Failed to delete user", e)
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
                    <p className="text-slate-500 mt-2">Manage your hierarchical structure of leaders and members.</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => { setIsAddingTeam(!isAddingTeam); setIsAddingUser(false); }} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <Plus className="w-4 h-4 mr-2" /> New Team
                    </Button>
                    <Button onClick={() => { setIsAddingUser(!isAddingUser); setIsAddingTeam(false); }} className="bg-indigo-600 hover:bg-indigo-700">
                        <UserPlus className="w-4 h-4 mr-2" /> Add Member
                    </Button>
                </div>
            </div>

            {isAddingTeam && (
                <Card className="border-indigo-100 shadow-sm bg-indigo-50/30">
                    <CardHeader>
                        <CardTitle>Create New Team</CardTitle>
                        <CardDescription>Teams group members together under a specific leader.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleTeamSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="teamName">Team Name</Label>
                                <Input id="teamName" placeholder="e.g. Sales Team Alpha" required value={teamFormData.name} onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })} />
                            </div>
                            <div>
                                <Label htmlFor="teamLeader">Assign Leader (Optional)</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={teamFormData.leaderId}
                                    onChange={(e) => setTeamFormData({ ...teamFormData, leaderId: e.target.value })}
                                >
                                    <option value="">Select a Leader</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Team"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {isAddingUser && (
                <Card className="border-indigo-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Add New Member</CardTitle>
                        <CardDescription>Enter details to add a new staff member to your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUserSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input placeholder="John Doe" required value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input type="email" placeholder="john@company.com" required value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input type="password" placeholder="••••••••" required value={userFormData.password} onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Access Level</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={userFormData.role}
                                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                                    >
                                        <option value="TEAM_MEMBER">Team Member (Chat only)</option>
                                        <option value="TEAM_LEADER">Team Leader (Manages Team)</option>
                                        <option value="CUSTOMER">Account Admin (Full Control)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Assign to Team</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={userFormData.teamId}
                                        onChange={(e) => setUserFormData({ ...userFormData, teamId: e.target.value })}
                                    >
                                        <option value="">No Team Assigned</option>
                                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-slate-800 shadow-lg">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Confirm Access"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Hierarchical Roster */}
            <div className="space-y-6">
                {teams.map(team => (
                    <Card key={team.id} className="border-l-4 border-l-indigo-600 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{team.name}</CardTitle>
                                    <CardDescription>Managed by {users.find(u => u.id === team.leaderId)?.name || 'Unassigned'}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Table>
                                <TableBody>
                                    {users.filter(u => u.team?.id === team.id).map(u => (
                                        <TableRow key={u.id} className="hover:bg-slate-50/50 border-none">
                                            <TableCell className="w-12">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                    {u.name.charAt(0)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-800">{u.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={u.role === 'TEAM_LEADER' ? 'default' : 'secondary'} className={u.role === 'TEAM_LEADER' ? 'bg-indigo-600' : 'bg-slate-100 text-slate-600'}>
                                                    {u.role.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-sm">
                                                <div className="flex items-center gap-2 italic">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {u.email}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => deleteUser(u.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {users.filter(u => u.team?.id === team.id).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4 text-slate-400 italic text-sm">Empty team. Assign members above.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}

                {/* Unassigned Members */}
                <Card className="border-dashed border-2 shadow-none border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-slate-500 flex items-center gap-2">
                            Unassigned Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                {users.filter(u => !u.team?.id).map(u => (
                                    <TableRow key={u.id} className="border-none">
                                        <TableCell className="w-12">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                                                {u.name.charAt(0)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-700">{u.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-slate-500 border-slate-200">
                                                {u.role.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-400 text-sm">{u.email}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => deleteUser(u.id)} className="text-slate-300 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
