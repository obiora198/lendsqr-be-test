export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
}

export const formatResponse = <T>(
  message: string,
  data: T,
  statusCode = 200,
  success = true,
): ApiResponse<T> => {
  return {
    success,
    message,
    data,
    statusCode,
  };
};

export const formatErrorResponse = (
  message: string,
  statusCode = 400,
  success = false,
): ApiResponse => {
  return {
    success,
    message,
    statusCode,
  };
};
