export const getRecommendations = async (preferences) => {
  // Existing implementation
};

export const optimizeTourRoute = async (routeData) => {
  const response = await fetch('/api/planner/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routeData)
  });
  return await response.json();
};