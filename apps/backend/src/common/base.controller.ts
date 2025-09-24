import { UnauthorizedException } from '@nestjs/common';

export abstract class BaseController {
  /**
   * Extracts user ID from Authorization Bearer token
   * @param request - Express request object
   * @returns User ID string
   * @throws UnauthorizedException if authorization header is invalid
   */
  protected extractUserIdFromAuthHeader(request: any): string {
    const authorization = request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header. Expected Bearer token.');
    }
    return authorization.substring(7); // Remove 'Bearer ' prefix
  }
}
