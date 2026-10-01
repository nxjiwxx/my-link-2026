"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

interface SkillChipsProps {
  skills: string[];
}

export function SkillChips({ skills }: SkillChipsProps) {
  return (
    <section className="px-4 py-2 select-none">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {skills.map((skill) => (
          <Badge
            key={skill}
            variant="neutral"
            className="bg-[#F2F4F6] text-[#333D4B] hover:bg-[#E5E8EB] border-0 px-2.5 py-1 text-xs rounded-lg font-medium transition-colors"
          >
            {skill}
          </Badge>
        ))}
      </div>
    </section>
  );
}
