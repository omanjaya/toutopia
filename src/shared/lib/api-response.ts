import { NextResponse } from "next/server";

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function successResponse<T>(
  data: T,
  meta?: SuccessResponse<T>["meta"],
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ success: true, data, meta }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status }
  );
}

export function unauthorizedResponse(
  message: string = "Authentication required"
): NextResponse<ErrorResponse> {
  return errorResponse("UNAUTHORIZED", message, 401);
}

export function forbiddenResponse(
  message: string = "Insufficient permissions"
): NextResponse<ErrorResponse> {
  return errorResponse("FORBIDDEN", message, 403);
}

export function notFoundResponse(
  resource: string = "Resource"
): NextResponse<ErrorResponse> {
  return errorResponse("NOT_FOUND", `${resource} not found`, 404);
}

export function validationErrorResponse(
  details: Record<string, unknown>
): NextResponse<ErrorResponse> {
  return errorResponse("VALIDATION_ERROR", "Invalid input", 422, details);
}

export function serverErrorResponse(
  message: string = "Internal server error"
): NextResponse<ErrorResponse> {
  return errorResponse("INTERNAL_ERROR", message, 500);
}
