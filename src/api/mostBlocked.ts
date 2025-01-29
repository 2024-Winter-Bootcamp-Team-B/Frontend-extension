import api from './api';

export interface MostBlockedRes {
  result?: string[] | string;
  message?: string;
}

export const fetchMostBlocked = async () => {
  try {
    const response = await api.get<MostBlockedRes>('/lock/most-blocked');
    return response.data;
  } catch (error) {
    Promise.reject(error);
  }
};
