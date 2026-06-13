import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

type Province = { code: string; nameKh: string; nameEn: string };
type District = { code: string; provinceCode: string; nameKh: string; nameEn: string };
type Commune = { code: string; districtCode: string; provinceCode: string; nameKh: string; nameEn: string };
type Village = { code: string; communeCode: string; districtCode: string; provinceCode: string; nameKh: string; nameEn: string };

type GeoDropdownsProps = {
  selectedProvince?: string;
  selectedDistrict?: string;
  selectedCommune?: string;
  selectedVillage?: string;
  onChange: (data: { province?: string; district?: string; commune?: string; village?: string }) => void;
  className?: string;
};

export function GeoDropdowns({
  selectedProvince = "",
  selectedDistrict = "",
  selectedCommune = "",
  selectedVillage = "",
  onChange,
  className = ""
}: GeoDropdownsProps) {
  const { token } = useAuth();
  
  const headers = {
    "Authorization": `Bearer ${token}`
  };

  const { data: provinces = [] } = useQuery<Province[]>({
    queryKey: ["geo", "provinces"],
    queryFn: () => fetch("/api/geo/provinces", { headers }).then(r => r.json())
  });

  const { data: districts = [] } = useQuery<District[]>({
    queryKey: ["geo", "districts", selectedProvince],
    queryFn: () => fetch(`/api/geo/districts?provinceCode=${selectedProvince}`, { headers }).then(r => r.json()),
    enabled: !!selectedProvince
  });

  const { data: communes = [] } = useQuery<Commune[]>({
    queryKey: ["geo", "communes", selectedDistrict],
    queryFn: () => fetch(`/api/geo/communes?districtCode=${selectedDistrict}`, { headers }).then(r => r.json()),
    enabled: !!selectedDistrict
  });

  const { data: villages = [] } = useQuery<Village[]>({
    queryKey: ["geo", "villages", selectedCommune],
    queryFn: () => fetch(`/api/geo/villages?communeCode=${selectedCommune}`, { headers }).then(r => r.json()),
    enabled: !!selectedCommune
  });

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">រាជធានី/ខេត្ត</label>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedProvince}
          onChange={(e) => onChange({ province: e.target.value, district: "", commune: "", village: "" })}
        >
          <option value="">-- ជ្រើសរើសខេត្ត --</option>
          {provinces.map(p => (
            <option key={p.code} value={p.code}>{p.nameKh}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ក្រុង/ស្រុក/ខណ្ឌ</label>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
          value={selectedDistrict}
          onChange={(e) => onChange({ province: selectedProvince, district: e.target.value, commune: "", village: "" })}
          disabled={!selectedProvince}
        >
          <option value="">-- ជ្រើសរើសស្រុក --</option>
          {districts.map(d => (
            <option key={d.code} value={d.code}>{d.nameKh}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ឃុំ/សង្កាត់</label>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
          value={selectedCommune}
          onChange={(e) => onChange({ province: selectedProvince, district: selectedDistrict, commune: e.target.value, village: "" })}
          disabled={!selectedDistrict}
        >
          <option value="">-- ជ្រើសរើសឃុំ --</option>
          {communes.map(c => (
            <option key={c.code} value={c.code}>{c.nameKh}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ភូមិ</label>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
          value={selectedVillage}
          onChange={(e) => onChange({ province: selectedProvince, district: selectedDistrict, commune: selectedCommune, village: e.target.value })}
          disabled={!selectedCommune}
        >
          <option value="">-- ជ្រើសរើសភូមិ --</option>
          {villages.map(v => (
            <option key={v.code} value={v.code}>{v.nameKh}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
