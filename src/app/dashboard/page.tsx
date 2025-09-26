"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const organization = useQuery(
    api.organizations.getUserOrganization,
    user ? { clerkId: user.id } : "skip"
  );

  const workers = useQuery(
    api.workers.getAllWorkers,
    userData?.organizationId
      ? { organizationId: userData.organizationId }
      : "skip"
  );

  const sections = useQuery(
    api.sections.getAllSections,
    userData?.organizationId
      ? { organizationId: userData.organizationId }
      : "skip"
  );

  const styles = useQuery(
    api.styles.getAllStyles,
    userData?.organizationId
      ? { organizationId: userData.organizationId }
      : "skip"
  );

  // Get today's production logs
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = useQuery(
    api.productionLogs.getProductionLogsByDate,
    userData?.organizationId
      ? {
        date: today,
        organizationId: userData.organizationId,
      }
      : "skip"
  );

  if (!userData || !organization) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalProducedToday =
    todayLogs?.reduce((sum, log) => sum + log.quantity, 0) || 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-sans font-bold">Dashboard</h1>
        <p className="text-base lg:text-lg text-muted-foreground mt-2">
          Welcome to {organization.name} - <span className="capitalize font-medium">{userData.role}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active workers in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Production sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducedToday}</div>
            <p className="text-xs text-muted-foreground">
              Items produced today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Styles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{styles?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Product styles available
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Production Logs</CardTitle>
            <CardDescription>
              Latest production entries from today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!todayLogs || todayLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No production logs for today yet. Start by logging production.
              </p>
            ) : (
              <div className="space-y-2">
                {todayLogs.slice(0, 5).map((log) => (
                  <div
                    key={log._id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>
                      {log.worker?.name} - {log.style?.name}
                    </span>
                    <span className="font-medium">{log.quantity} units</span>
                  </div>
                ))}
                {todayLogs.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{todayLogs.length - 5} more entries
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your production tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sections?.length === 0 && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/dashboard/sections">
                  1. Create your first section
                </Link>
              </Button>
            )}
            {workers?.length === 0 && sections && sections.length > 0 && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/dashboard/workers">
                  2. Add workers to sections
                </Link>
              </Button>
            )}
            {styles?.length === 0 && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/dashboard/styles">3. Create product styles</Link>
              </Button>
            )}
            {workers && workers.length > 0 && styles && styles.length > 0 && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/dashboard/production">
                  4. Log daily production
                </Link>
              </Button>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Organization Code:
              </p>
              <code className="text-sm font-mono bg-gray-100 text-black  px-2 py-1 rounded">
                {organization.inviteCode}
              </code>
              <p className="text-xs text-muted-foreground mt-1">
                Share this code to invite team members
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
