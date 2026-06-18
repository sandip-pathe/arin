export const handleProcessingError = (context: string, error: unknown) => {
  console.error(`[${context}]`, error);
};
