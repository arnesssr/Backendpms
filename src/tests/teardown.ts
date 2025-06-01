export default async () => {
  // Ensure all connections are closed
  await new Promise(resolve => setTimeout(resolve, 500));
};
