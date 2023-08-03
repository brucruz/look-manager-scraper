export default class Error {
  public readonly message: string;

  public readonly statusCode: number; // http status code

  constructor(message: string, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
}
