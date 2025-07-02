import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ScheduleMeetingInput {
  title: string;
  description: string;
  date: string;
  time: string;
  candidateId: string;
  interviewerIds: string[];
}

export async function scheduleMeeting(
  _ctx: any,
  { title, description, date, time, candidateId, interviewerIds }: ScheduleMeetingInput
) {
  const startTime = new Date(`${date}T${time}`).getTime();
  const streamCallId = crypto.randomUUID();
  try {
    await convex.mutation(api.interviews.createInterviewPublic, {
      title,
      description,
      startTime,
      status: "upcoming",
      streamCallId,
      candidateId,
      interviewerIds,
    });
    return { success: true, message: "Meeting scheduled!" };
  } catch (error) {
    return { success: false, message: `Error scheduling meeting: ${error}` };
  }
}

export async function checkPendingMeetings(_ctx: any, { userId }: { userId: string }) {
  try {
    // Find the user by userId (_id)
    const users = await convex.query(api.users.getAllUsersPublic, {});
    const user = users.find((u: any) => u._id === userId);
    if (!user) {
      return { pending: [], message: "User not found" };
    }
    // Use the public query for interviews
    const meetings = await convex.query(api.interviews.getAllInterviewsPublic, {});
    const pending = meetings.filter(
      (m: any) =>
        m.status === "upcoming" &&
        (m.candidateId === user._id || (Array.isArray(m.interviewerIds) && m.interviewerIds.includes(user._id)))
    );
    return { pending };
  } catch (error) {
    return { pending: [], message: `Error fetching meetings: ${error}` };
  }
}

export async function listPassedCandidates() {
  try {
    // Get all users with role 'candidate'
    const users = await convex.query(api.users.getAllUsersPublic, {});
    const candidates = users.filter((u: any) => u.role === "candidate");
    // Get all interviews with status 'succeeded'
    const meetings = await convex.query(api.interviews.getAllInterviewsPublic, {});
    const passedMeetings = meetings.filter((m: any) => m.status === "succeeded");
    // Get unique candidate IDs from passed meetings
    const candidateIds = [...new Set(passedMeetings.map((m: any) => m.candidateId))];
    // Get candidate names
    const passedCandidates = candidates.filter((c: any) => candidateIds.includes(c._id)).map((c: any) => c.name);
    return { candidates: passedCandidates };
  } catch (error) {
    return { candidates: [], message: `Error fetching passed candidates: ${error}` };
  }
}

export async function listFailedCandidates(){
  try {
    // Get all users with role 'candidate'
    const users = await convex.query(api.users.getAllUsersPublic, {});
    const candidates = users.filter((u: any) => u.role === "candidate");
    // Get all interviews with status 'succeded'
    const meetings = await convex.query(api.interviews.getAllInterviewsPublic, {});
    const failedMeetings = meetings.filter((m: any) => m.status === "failed");
    // Get unique candidate IDs from passed meetings
    const candidateIds = [...new Set(failedMeetings.map((m: any) => m.candidateId))];
    // Get candidate names
    const failedCandidates = candidates.filter((c: any) => candidateIds.includes(c._id)).map((c: any) => c.name);
    return { candidates: failedCandidates };
  } catch (error) {
    return { candidates: [], message: `Error fetching failed candidates: ${error}` };
  }
}