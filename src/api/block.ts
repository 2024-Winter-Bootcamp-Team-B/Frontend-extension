import api from './api';

export interface BlockReq {
  user_id: number;
  start_time: string;
  goal_time: string;
  sites: string[];
}

export interface BlockRes {
  message: string;
  data?: Data;
}

interface Data {
  user_id: number;
  start_time: string;
  goal_time: string;
  sites: string[];
}

export const blockSites = async (req: BlockReq) => {
  const { user_id, start_time, goal_time, sites } = req;
  try {
    const response = await api.post<BlockRes>('/lock/block', {
      user_id,
      start_time,
      goal_time,
      sites,
    });
    return response.data;
  } catch (error) {
    Promise.reject(error);
  }
};
