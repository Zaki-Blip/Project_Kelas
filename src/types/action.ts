export type AuthFormValues = {
  identifier?: string;
  fullName?: string;
  username?: string;
  email?: string;
};

export type AuthActionState = {
  formError?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: AuthFormValues;
};

export type AdminActionState = {
  formError?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type FeedbackActionState = {
  formError?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
