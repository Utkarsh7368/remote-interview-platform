import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import * as meetingActions from "@/copilotkit/actions/meetings.server";

import { NextRequest } from 'next/server';

const serviceAdapter = new GoogleGenerativeAIAdapter({ model: "gemini-2.0-flash" });
const runtime = new CopilotRuntime({
  actions: [
    {
      name: "scheduleMeeting",
      description: "Schedule a new meeting with title, description, date, time, candidateId, and interviewerIds.",
      parameters: [
        { name: "title", type: "string", description: "Meeting title" },
        { name: "description", type: "string", description: "Meeting description" },
        { name: "date", type: "string", description: "Date in YYYY-MM-DD format" },
        { name: "time", type: "string", description: "Time in HH:mm format" },
        { name: "candidateId", type: "string", description: "Candidate user ID" },
        { name: "interviewerIds", type: "string[]", description: "Array of interviewer user IDs" }
      ],
      handler: (params: any) => meetingActions.scheduleMeeting(undefined, params),
    },
    {
      name: "checkPendingMeetings",
      description: "Check for pending (upcoming) meetings for a user.",
      parameters: [
        { name: "userId", type: "string", description: "User ID to check for pending meetings" }
      ],
      handler: (params: any) => meetingActions.checkPendingMeetings(undefined, params),
    }
  ]
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};