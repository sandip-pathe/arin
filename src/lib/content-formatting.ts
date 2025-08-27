export function formatContent(content: string): string {
  // Remove excessive whitespace and line breaks
  if (!content || content.trim().length === 0) return "";

  // Remove excessive whitespace and line breaks
  let formatted = content
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/(\r\n|\n|\r)+/g, "\n") // Normalize line breaks
    .trim();

  // Capitalize first letter
  if (formatted.length > 0) {
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  // Ensure proper punctuation
  if (!/[.!?]$/.test(formatted)) {
    formatted += ".";
  }

  return formatted;
}
