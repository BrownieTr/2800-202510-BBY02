import ProfileIcon from "./profileIcon";

export default function GlassChatBubble({
  username = "username",
  message = "message",
  isSent,
  profilePic = "https://www.dummyimage.com/25x25/000/fff",
  timestamp,
}) {
  // Format timestamp if provided
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
  return (
    <div className="mb-4 px-2">
      {/* Username display */}
      <div className={`mb-1 ${isSent ? "text-right" : "text-left"}`}>
        <p className="text-sm text-white opacity-80">{username}</p>
      </div>

      {/* Chat bubble with profile icon */}
      <div className={`flex items-end ${isSent ? "flex-row-reverse" : ""}`}>
        <div className={`flex-shrink-0 ${isSent ? "ml-2" : "mr-2"}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white border-opacity-30">
            <ProfileIcon profilePic={profilePic} size={32} />
          </div>
        </div>
        <div
          className={`${
            isSent
              ? "bg-blue-500 bg-opacity-40 border border-blue-300 border-opacity-30"
              : "bg-gray-700 bg-opacity-60 border border-gray-500 border-opacity-30"
          } backdrop-filter backdrop-blur-sm rounded-2xl px-4 py-2 max-w-xs`}
        >
          <p className="text-white">{message}</p>
          {timestamp && (
            <p className="text-right text-xs mt-1 text-white opacity-60">
              {formattedTime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}