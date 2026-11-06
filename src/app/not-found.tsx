import Link from "next/link";
import { UserX, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#F2F4F6] flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-[480px] bg-white rounded-none border border-[#E5E8EB] shadow-none p-8 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#FEECEF] text-[#E8344E] flex items-center justify-center mb-5">
          <UserX className="w-8 h-8" />
        </div>

        <span className="text-xs font-semibold tracking-wider uppercase text-[#8B95A1] mb-1">
          404 Not Found
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-[#191F28] mb-2">
          사용자를 찾을 수 없습니다
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7684] leading-relaxed max-w-sm mb-7">
          입력하신 사용자 이름(username)의 프로필이 존재하지 않거나, 주소가 올바르지 않습니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-[#191F28] text-white hover:bg-[#333D4B] transition-colors"
          >
            <span>홈으로 이동</span>
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 px-4 text-xs sm:text-sm font-semibold rounded-xl border border-[#E5E8EB] text-[#333D4B] hover:bg-[#F9FAFB] transition-colors"
          >
            <span>내 프로젝트 만들러가기</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
