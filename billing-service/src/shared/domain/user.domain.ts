export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly passwordHash: string,
    public readonly verified: boolean,
    public readonly roleId: string,
  ) {}
}
