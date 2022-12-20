import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import type { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { createApi } from '@reduxjs/toolkit/query/react';

import { Tags } from './tags';

const axiosBaseQuery = (): BaseQueryFn<
  {
    url: string;
    method?: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    headers?: AxiosRequestConfig['headers'];
  },
  unknown,
  unknown
> => {
  return async ({ url, method = 'GET', data, headers }) => {
    try {
      const result = await axios(url, {
        method,
        data,
        headers,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: { status: err.response?.status, data: err.response?.data },
      };
    }
  };
};

export const appDevelopmentApi = createApi({
  reducerPath: 'appDevelopmentApi',
  tagTypes: Object.values(Tags),
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),
});
