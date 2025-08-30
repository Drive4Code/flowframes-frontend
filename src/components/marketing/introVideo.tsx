export const MarketingVideo = ({ className }: { className?: string }) => {
  return (
    <div className={`text-white p-8 ${className}`}>
      <h2 className="text-4xl font-bold text-center mb-8">
        World's <b className="glowing">#1</b> Autonomous Video Editor
      </h2>
     <iframe src="/animation.html"></iframe> 
    </div>
  );
}

