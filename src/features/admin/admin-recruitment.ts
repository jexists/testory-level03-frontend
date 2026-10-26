import { cache } from 'react';
import { serverApi } from '@/lib/server-api';
import type { Recruitment, Stage } from '@/lib/types';

export type AdminRecruitmentDetail = Recruitment & { stage: Stage; feedbackCount: number; feedbackAuthorCount: number; cancelledCount: number };

/** 상세 layout 과 각 탭이 같은 요청 안에서 모집글을 한 번만 불러오게 한다. */
export const getAdminRecruitment = cache((id: number) => serverApi<AdminRecruitmentDetail>(`/admin/recruitments/${id}`));
