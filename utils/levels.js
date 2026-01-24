const getLevelFromPoints = (points) => {
  if (points >= 5000) return { level: 5, name: "Money Mentor" };
  if (points >= 3000) return { level: 4, name: "Strategist" };
  if (points >= 1500) return { level: 3, name: "Builder" };
  if (points >= 400) return { level: 2, name: "Saver" };
  return { level: 1, name: "Beginner" };
};

module.exports = { getLevelFromPoints };
