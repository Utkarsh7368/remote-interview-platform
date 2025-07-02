"use client";

import LoaderUI from "@/components/LoaderUI";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import InterviewScheduleUI from "./InterviewScheduleUI";

function SchedulePage() {
  const router = useRouter();
  const { isInterviewer, isLoading } = useUserRole();

  // Move navigation into useEffect
  useEffect(() => {
    if (!isLoading && !isInterviewer) {
      router.push("/");
    }
  }, [isLoading, isInterviewer, router]);

  if (isLoading) return <LoaderUI />;
  if (!isInterviewer) return null;

  return <InterviewScheduleUI />;
}
export default SchedulePage;
