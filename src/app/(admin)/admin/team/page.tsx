export const dynamic = 'force-dynamic';

import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Cleaner from "@/models/Cleaner";
import CleanerInvitation from "@/models/CleanerInvitation";
import { TeamPageClient } from "./TeamPageClient";

async function getTeamData() {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    redirect("/");
  }

  const cleaners = await Cleaner.find({ managerId: userId })
    .sort({ createdAt: -1 })
    .lean();

  const invitations = await CleanerInvitation.find({ managerId: userId })
    .sort({ createdAt: -1 })
    .lean();

  return {
    cleaners: cleaners.map(c => ({
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone,
      status: c.status,
      lastActiveAt: c.lastActiveAt?.toISOString(),
      createdAt: c.createdAt.toISOString(),
    })),
    invitations: invitations.map(inv => ({
      id: inv._id.toString(),
      code: inv.code,
      status: inv.status,
      cleanerName: inv.cleanerName,
      expiresAt: inv.expiresAt.toISOString(),
      createdAt: inv.createdAt.toISOString(),
    })),
  };
}

export default async function TeamPage() {
  const data = await getTeamData();

  return <TeamPageClient initialData={data} />;
}
