import { BancorV2Api } from 'services/api/bancorApi/bancorApiV2';
import { BancorV3Api } from 'services/api/bancorApi/bancorApiV3';
import { ZeroExApi } from './ZeroExApi';

export abstract class BancorApi {
  static v2 = BancorV2Api;
  static v3 = BancorV3Api;
  static ZeroEx = ZeroExApi;
}
