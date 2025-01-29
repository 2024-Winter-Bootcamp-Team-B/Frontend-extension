import api from './api';

export interface checkReq {
  user_id: number;
}

export interface checkRes {
  message?: string;
  user_id?: number;
  sites?: string[];
  detail?: string;
}

export const checkBlock = async (req: checkReq) => {
  const { user_id } = req;
  try {
    const response = await api.get<checkRes>(`/lock/blocked-site/${user_id}`);
    return response.data;
  } catch (error) {
    Promise.reject(error);
  }
};
