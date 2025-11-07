import Image from "next/image";

const Agents = () => {
  const isSpeaking = true;

  return (
    <div className="call-view">
      <div className="card-interviewer">
        <div className="avatar">
          <Image
            src="/ai-avatar.png"
            alt="vapi"
            width={65}
            height={54}
            className="object-cover"
          />
          {isSpeaking && (
            <span>
              <div className="animate-speak"></div>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Agents;
