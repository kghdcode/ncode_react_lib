import axios, { AxiosRequestConfig, Method } from "axios";
import { NCNetworking, NCNetworkMethod } from "@ncodedcode/ncode_react_lib";
import { NCNetworkResponse } from "@ncodedcode/ncode_react_lib";
import { NCLog } from "@ncodedcode/ncode_react_lib";

export class AxiosNetworking implements NCNetworking {
  private commonHeader: { [key: string]: string } = {};

  private _baseUrl: string = "";

  constructor(baseUrl: string) {
    this.setBaseUrl(baseUrl);
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  setBaseUrl(baseUrl: string): void {
    this._baseUrl = baseUrl;
  }

  addCommonHeader(key: string, value: string): void {
    this.commonHeader[key] = value;
  }

  commonHeaders(): { [p: string]: string } {
    return { ...this.commonHeader };
  }

  deleteCommonHeader(key: string): void {
    delete this.commonHeader[key];
  }

  execute(
    method: NCNetworkMethod,
    url: string,
    queryParam: { [p: string]: any } | undefined,
    requestBody: { [p: string]: any } | FormData | undefined,
    header: { [p: string]: string },
    applyCommonHeader: boolean
  ): Promise<NCNetworkResponse> {
    const headers: { [p: string]: string } = {};

    const config: AxiosRequestConfig = {
      method: method as Method,
      url: url.startsWith("http") ? url : `${this._baseUrl}${url}`,
      headers,
      params: queryParam,
      data: requestBody,
    };

    return axios
      .request(config)
      .then((res) => {
        const status = res.status;
        const data = res.data;
        return new NCNetworkResponse(status, "", data);
      })
      .catch((e) => {
        const status = e.response?.status || 999;
        const message = e.response?.data.message;
        const data = e.response?.data || "";
        return new NCNetworkResponse(status, message, data);
      });
  }
}

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    NCLog.e("intercepter", error);
    return Promise.reject(error);
  }
);
