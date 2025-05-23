export default function Features() {
  const features = [
    {
      id: 1,
      title: "Match with Other Players",
      description: "Find competitors based on location, timing and skill level.",
      icon: "🏆"
    },
    {
      id: 2,
      title: "Chat with Other Users",
      description: "Communicate directly with potential opponents to arrange matches.",
      icon: "💬"
    },
    {
      id: 3,
      title: "Events",
      description: "Create, delete or sign up for local sporting events in your community.",
      icon: "📅"
    },
    {
      id: 4,
      title: "Wagering on Matches",
      description: "Add excitement with friendly wagers on your competitions.",
      icon: "🎲"
    }
  ];

  return (
    <section id="features">
      <h2>Features</h2>
      <div className="features-grid">
        {features.map(feature => (
          <div key={feature.id} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}