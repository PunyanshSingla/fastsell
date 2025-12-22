/**
 * Serializes a MongoDB/Mongoose document or array of documents into a plain object.
 * This converts ObjectIds to strings and handles other non-serializable types for Next.js Client Components.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
