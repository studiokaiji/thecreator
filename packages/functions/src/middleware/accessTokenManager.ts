import { database } from 'firebase-admin';
import { sign, verify, VerifyOptions } from 'jsonwebtoken';

export class AccessTokenManager<T extends string | object | Buffer> {
  readonly refreshTokenRef: database.Reference;
  private _secretKey: string;
  readonly accessTokenExpiresIn: string | number;
  readonly refreshTokenExpiresIn: string | number;

  constructor(
    refreshTokenRef: database.Reference,
    secretKey: string,
    accessTokenExpiresIn: string | number = '30m',
    refreshTokenExpiresIn: string | number = '7d'
  ) {
    this.refreshTokenRef = refreshTokenRef;
    this._secretKey = secretKey;
    this.accessTokenExpiresIn = accessTokenExpiresIn;
    this.refreshTokenExpiresIn = refreshTokenExpiresIn;
  }

  async generateNewAccessToken(
    child: string,
    payload: T,
    accessTokenExpiresIn?: string | number,
    refreshTokenExpiresIn?: string | number
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = sign(payload, this._secretKey, {
      expiresIn: accessTokenExpiresIn || this.accessTokenExpiresIn,
    });

    const refreshToken = sign(payload, this._secretKey, {
      expiresIn: refreshTokenExpiresIn || this.refreshTokenExpiresIn,
    });
    await this.refreshTokenRef.child(child).set(refreshToken);

    return { accessToken, refreshToken };
  }

  private async _generateRefreshToken(
    child: string,
    payload: T,
    refreshTokenExpiresIn?: string | number
  ) {
    const refreshToken = sign(payload, this._secretKey, {
      expiresIn: refreshTokenExpiresIn || this.refreshTokenExpiresIn,
    });

    await this.refreshTokenRef.child(child).set(refreshToken);

    return refreshToken;
  }

  async refreshAccessToken(
    child: string,
    currentRefreshToken: string,
    accessTokenExpiresIn?: string | number,
    refreshTokenExpiresIn?: string | number
  ) {
    const payload = await this.verifyRefreshToken(child, currentRefreshToken);

    const accessToken = sign(payload, this._secretKey, {
      expiresIn: accessTokenExpiresIn || this.accessTokenExpiresIn,
    });

    const refreshToken = await this._generateRefreshToken(
      child,
      payload,
      refreshTokenExpiresIn
    );

    return { accessToken, refreshToken };
  }

  async removeRefreshToken(child: string) {
    await this.refreshTokenRef.child(child).remove();
  }

  async verifyAccessToken(accessToken: string, options?: VerifyOptions) {
    return verify(accessToken, this._secretKey, options) as T;
  }

  async verifyRefreshToken(child: string, refreshToken: string) {
    const refreshTokenSnapshot = await this.refreshTokenRef.child(child).get();

    if (!refreshTokenSnapshot.exists()) {
      throw Error('Refresh token does not exist');
    }

    return new Promise<T>((resolve, reject) => {
      verify(refreshToken, this._secretKey, (err, detail) => {
        if (err || !detail) {
          return reject('Invalid refresh token');
        }
        return resolve(detail as T);
      });
    });
  }
}
