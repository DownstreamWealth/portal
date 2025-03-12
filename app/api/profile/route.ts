import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getUserById, getUserProfile, updateProfile, updateUserStatus } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id);

    // Get user data
    const userData = await getUserById(userId);

    if (!userData || userData.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get profile data
    const profileData = await getUserProfile(userId);

    // Combine user and profile data
    const user = userData[0];
    const profile = profileData.length > 0 ? profileData[0] : {};

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      ...profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = Number.parseInt(session.user.id);
    const data = await request.json();
    const { type, ...profileData } = data;

    // Update profile
    await updateProfile(userId, profileData, type as 'personal' | 'business');

    // If profile is complete and user is explorer, update to prospect
    if (session.user.status === "explorer") {
      const updatedProfile = await getUserProfile(userId);

      if (updatedProfile.length > 0) {
        const profile = updatedProfile[0];

        // Check if essential fields are filled
        if (
          profile.phone &&
          profile.address &&
          profile.city &&
          profile.state &&
          profile.zipCode
        ) {
          await updateUserStatus(userId, "prospect");
        }
      }
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "An error occurred while updating profile" },
      { status: 500 }
    );
  }
}
