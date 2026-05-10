export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ status: "ok", data }, init);
}

export function err(message: string, status = 500) {
  return Response.json({ status: "error", message }, { status });
}
