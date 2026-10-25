// What a form action sends back to the form.
export type ActionState =
  | { error?: string; message?: string; tempPassword?: string; email?: string; id?: string }
  | undefined;
