"use client";
import { useEffect, useState } from "react";
import { Field, Select } from "@/shared/components/ui/field";
import { Segmented } from "@/shared/components/ui/tabs";
import type { DeviceModel, Os } from "@/shared/types/api";
import { deviceModelsApi } from "./api";

export interface DeviceValue { os: Os | ""; modelId: number | null }

/** 가입 화면과 마이페이지가 함께 쓰는 "내 기기" 선택(OS + 모델 목록). */
export function DevicePicker({ value, onChange, error }: { value: DeviceValue; onChange: (v: DeviceValue) => void; error?: string | null }) {
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    deviceModelsApi.list().then(setModels).catch(() => setFailed(true));
  }, []);

  const list = models.filter((m) => m.os === value.os);
  return (
    <div className="space-y-4">
      <Field label="내 기기 OS" error={error && !value.os ? error : null}>
        <Segmented
          label="내 기기 OS" value={value.os}
          options={[{ value: "ANDROID", label: "Android" }, { value: "IOS", label: "iOS" }]}
          onChange={(os) => onChange({ os, modelId: null })}
        />
      </Field>
      <Field label="내 기기 모델" error={failed ? "모델 목록을 불러오지 못했어요. 새로고침해 주세요." : error && value.os ? error : null}>
        <Select
          value={value.modelId ?? ""} disabled={!value.os}
          onChange={(e) => onChange({ ...value, modelId: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">{value.os ? "모델을 골라 주세요" : "먼저 OS를 골라 주세요"}</option>
          {list.map((m) => <option key={m.id} value={m.id}>{m.modelName}</option>)}
        </Select>
      </Field>
    </div>
  );
}
