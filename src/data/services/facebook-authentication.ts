import { LoadFacebookUserApi } from '@/data/contracts/api'
import { LoadUserAccountRepository } from '@/data/contracts/repos'
import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthentication } from '@/domain/features'

export class FacebookAuthenticationService {
  constructor (
    private readonly loadFacebookUserByTokenApi: LoadFacebookUserApi,
    private readonly loadUserAccountRepository: LoadUserAccountRepository
  ) {}

  async perform (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
    const facebookData = await this.loadFacebookUserByTokenApi.loadUser(params)

    if (facebookData !== undefined) {
      await this.loadUserAccountRepository.load({ email: facebookData.email })
    }

    return new AuthenticationError()
  }
}
