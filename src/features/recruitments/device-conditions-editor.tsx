"use client";
import { useEffect, useState } from "react";
import { deviceModelsApi } from "@/features/auth/api";
import { Button } from "@/shared/components/ui/button";
import { Select } from "@/shared/components/ui/field";
import { OS_LABEL } from "@/shared/constants/labels";
import type { DeviceModel, Os, RecruitmentInput } from "@/shared/types/api";

type Cond = RecruitmentInput["devices"][number];

/** 허용 기기 조건: Android 전체 / iOS 전체 / 특정 모델(목록에서만 선택). 겹침 검사는 서버(R8)가 한다. */
export function DeviceConditionsEditor({ value, onChange }: { value: Cond[]; onChange: (v: Cond[]) => void }) {
  const [models, setModels] = useState<DeviceModel[]>([]);
  useEffect(() => { deviceModelsApi.list().then(setModels).catch(() => {}); }, []);

  const label = (c: Cond) => (c.scope === "ALL" ? `${OS_LABEL[c.os]} 전체` : models.find((m) => m.id === c.deviceModelId)?.modelName ?? "모델");

  function add(v: string) {
    if (!v) return;
    const [kind, arg] = v.split(":");
    if (kind === "ALL") onChange([...value, { os: arg as Os, scope: "ALL", deviceModelId: null }]);
    else {
      const m = models.find((x) => x.id === Number(arg));
      if (m) onChange([...value, { os: m.os, scope: "MODEL", deviceModelId: m.id }]);
    }
  }

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-3 border-t border-line">
          {value.map((c, i) => (
            <li key={i} className="flex items-center justify-between border-b border-line">
              <span className="py-3 font-semibold">{label(c)}</span>
              <Button variant="danger" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`${label(c)} 빼기`}>빼기</Button>
            </li>
          ))}
        </ul>
      )}
      <Select value="" onChange={(e) => add(e.target.value)} aria-label="기기 조건 추가">
        <option value="">기기 조건 추가하기</option>
        <option value="ALL:ANDROID">Android 전체</option>
        <option value="ALL:IOS">iOS 전체</option>
        {(["ANDROID", "IOS"] as Os[]).map((os) => (
          <optgroup key={os} label={`${OS_LABEL[os]} 특정 모델`}>
            {models.filter((m) => m.os === os).map((m) => <option key={m.id} value={`MODEL:${m.id}`}>{m.modelName}</option>)}
          </optgroup>
        ))}
      </Select>
    </div>
  );
}
