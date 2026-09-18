/**
 * Domain errors.
 *
 * Lives in `lib/` rather than the service layer so controllers can map a
 * failure to its meaning without importing downward into services - and so
 * nothing has to match on `Error.message` strings to tell a missing row from a
 * duplicate one.
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT');
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED');
  }
}

export class BadRequestError extends DomainError {
  constructor(message: string) {
    super(message, 'BAD_REQUEST');
  }
}
