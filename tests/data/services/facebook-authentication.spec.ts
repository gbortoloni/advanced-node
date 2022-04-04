import { mock, MockProxy } from 'jest-mock-extended'

import { FacebookAuthenticationService } from '@/data/services'
import { AuthenticationError } from '@/domain/errors'
import { LoadFacebookUserApi } from '@/data/contracts/api'
import { LoadUserAccountRepository, CreateFacebookAccountRepository } from '@/data/contracts/repos'

describe('FacebookAuthenticationService', () => {
  let facebookApi: MockProxy<LoadFacebookUserApi>
  let userAccountRepository: MockProxy<LoadUserAccountRepository & CreateFacebookAccountRepository>
  let sut: FacebookAuthenticationService
  const token = 'any_token'

  beforeEach(() => {
    facebookApi = mock()

    facebookApi.loadUser.mockResolvedValue({
      name: 'any_facebook_name',
      email: 'any_facebook_email',
      facebookId: 'any_facebook_id'
    })

    userAccountRepository = mock()

    sut = new FacebookAuthenticationService(
      facebookApi,
      userAccountRepository
    )
  })
  it('should call load facebook user api with correct params', async () => {
    await sut.perform({ token })

    expect(facebookApi.loadUser).toHaveBeenCalledWith({ token: 'any_token' })
    expect(facebookApi.loadUser).toHaveBeenCalledTimes(1)
  })

  it('should return AuthenticationError when load facebook user api returns undefined', async () => {
    facebookApi.loadUser.mockResolvedValueOnce(undefined)
    const authResult = await sut.perform({ token })

    expect(authResult).toEqual(new AuthenticationError())
  })

  it('should call loadUserAccountRepository when load facebook user api returns data', async () => {
    await sut.perform({ token })

    expect(userAccountRepository.load).toHaveBeenCalledWith({ email: 'any_facebook_email' })
    expect(userAccountRepository.load).toHaveBeenCalledTimes(1)
  })

  it('should call createUserAccountRepository when load facebook user api returns undefined', async () => {
    userAccountRepository.load.mockResolvedValueOnce(undefined)

    await sut.perform({ token })

    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledWith(
      {
        name: 'any_facebook_name',
        email: 'any_facebook_email',
        facebookId: 'any_facebook_id'
      }
    )
    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledTimes(1)
  })
})
