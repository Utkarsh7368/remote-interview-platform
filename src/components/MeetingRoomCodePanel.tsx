import { useCall } from "@stream-io/video-react-sdk";
import { useState } from "react";
import { CollaborativeCodeEditor } from "./CollaborativeCodeEditor";
import { LANGUAGES } from "@/constants";

function MeetingRoomCodePanel() {
  const call = useCall();
  // Default to first language, or you can sync this via Convex for all users
  const [language, setLanguage] = useState(LANGUAGES[0].id);
  if (!call) return null;
  return (
    <CollaborativeCodeEditor meetingId={call.id} language={language} />
  );
}
export default MeetingRoomCodePanel;
