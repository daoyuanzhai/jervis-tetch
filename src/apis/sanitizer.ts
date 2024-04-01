type SanitizationRules = {
  [key: string]: (value: any) => any;
};

const globalSanitizationRules: { [typeName: string]: SanitizationRules } = {
  MessageContent: {
    // Adjust the rule for 'text' to show the first 5 characters and mask the rest
    text: (value: string) =>
      value.length > 5 ? value.substring(0, 5) + "***" : value,
    // Other fields and types as necessary
  },
  // Additional types and their rules can be defined here
};

export function sanitize<T extends { [key: string]: any }>(
  object: T,
  typeName: string
): T {
  const rules = globalSanitizationRules[typeName];
  if (!rules) return object; // If no rules are defined for this type, return the object as is

  // Initialize a new object to accumulate sanitized values
  const sanitized: { [key: string]: any } = {};

  Object.keys(object).forEach((key) => {
    const value = object[key];
    const sanitizeFunction = rules[key];
    // Apply the sanitization function if it exists, or use the original value
    sanitized[key] = sanitizeFunction ? sanitizeFunction(value) : value;
  });

  return sanitized as T;
}
