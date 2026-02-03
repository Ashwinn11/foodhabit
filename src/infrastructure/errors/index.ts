/**
 * Custom Error Classes for Infrastructure
 */

export class DatabaseError extends Error {
    constructor(
        message: string,
        public readonly cause?: unknown,
        public readonly code?: string
    ) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export class NotFoundError extends Error {
    constructor(
        public readonly entity: string,
        public readonly id: string
    ) {
        super(`${entity} with id ${id} not found`);
        this.name = 'NotFoundError';
    }
}

export class ValidationError extends Error {
    constructor(
        message: string,
        public readonly field?: string
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}
