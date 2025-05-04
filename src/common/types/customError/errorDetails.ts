export interface ErrorDetails extends Record<string, unknown> {
  field?: string;
  issue?: string;
}
