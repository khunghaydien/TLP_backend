export interface SignInDto {
  email: string;
  password: string;
}

export interface SignInResult {
  user: { id: string; email: string };
  accessToken: string;
  refreshToken: string;
}
