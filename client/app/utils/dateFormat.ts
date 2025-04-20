import {
  format,
  isToday,
  isYesterday,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from "date-fns";
import { th } from "date-fns/locale";

/**
 * ฟังก์ชันแปลงวันที่เป็นรูปแบบที่เหมาะสมตามช่วงเวลาที่ผ่านไป
 * - หากเป็นวันนี้: แสดงเวลา (HH:mm)
 * - หากเป็นเมื่อวานนี้: แสดงคำว่า "เมื่อวาน"
 * - หากไม่เกิน 7 วัน: แสดงชื่อวัน (จันทร์, อังคาร, ...)
 * - หากไม่เกิน 12 เดือน: แสดงวันที่/เดือน (12/04)
 * - หากเกิน 12 เดือน: แสดงจำนวนปีที่ผ่านมา (1 ปีที่แล้ว, 2 ปีที่แล้ว, ...)
 */

export const formatTime = (dateString: string): string => {
  try {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    // ตรวจสอบความถูกต้องของวันที่
    if (isNaN(date.getTime())) {
      return "";
    }

    // ถ้าเป็นวันนี้ แสดงเฉพาะเวลา
    if (isToday(date)) {
      return format(date, "HH:mm", { locale: th });
    }

    // ถ้าเป็นเมื่อวาน
    if (isYesterday(date)) {
      return "เมื่อวาน";
    }

    // ถ้าไม่เกิน 7 วัน แสดงชื่อวัน
    const daysDiff = differenceInDays(now, date);
    if (daysDiff < 7) {
      return format(date, "EEEE", { locale: th }); // ชื่อวันเต็ม เช่น "จันทร์"
    }

    // ถ้าไม่เกิน 12 เดือน แสดงวันที่และเดือน
    const monthsDiff = differenceInMonths(now, date);
    if (monthsDiff < 12) {
      return format(date, "d/MMM", { locale: th }); // เช่น "12/เม.ย."
    }

    // ถ้าเกิน 12 เดือน แสดงจำนวนปีที่ผ่านมา
    const yearsDiff = differenceInYears(now, date);
    return `${yearsDiff} ปีที่แล้ว`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

export default formatTime;

