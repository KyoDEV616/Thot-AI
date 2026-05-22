import { Sidebar } from "../components/Sidebar/Sidebar";
import { ChatArea } from "../components/Chat/ChatArea";
import { TitleBar } from "../components/TitleBar";

export function ChatPage() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ChatArea />
      </div>
    </div>
  );
}
